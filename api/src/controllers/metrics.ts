import { Count } from "../models/count.m.js";
import { Request, Response } from "express";
import { Op, fn, col, literal } from "sequelize";

// Interfaces para los resultados de queries agregadas
interface TotalsResult {
  totalPlays: string;
  totalDownloads: string;
  totalProcesses: string;
  uniqueUsers: string;
}

interface DailyDataResult {
  dateSave: string;
  plays: string;
  downloads: string;
  processes: string;
  users: string;
}

interface TopUserResult {
  username: string;
  totalPlays: string;
  totalDownloads: string;
  totalProcesses: string;
}

interface WeeklyDataResult {
  weekStart: string;
  plays: string;
  downloads: string;
  processes: string;
  activeUsers: string;
}

interface UserTotalsResult {
  totalPlays: string;
  totalDownloads: string;
  totalProcesses: string;
  activeDays: string;
}

interface UserRankingResult {
  username: string;
  totalDownloads: string;
}

/**
 * Obtiene métricas generales de descargas, plays y procesos de TODOS los usuarios
 * Solo accesible para rootAdmin
 * Query params:
 * - period: 'day' | 'week' | 'month' (default: 'month')
 */
export const getMetrics = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const whereClause: any = {
      dateSave: { [Op.gte]: startDate }
    };

    // Obtener totales del período
    const totals = await Count.findOne({
      where: whereClause,
      attributes: [
        [fn('SUM', col('countPlay')), 'totalPlays'],
        [fn('SUM', col('countDownload')), 'totalDownloads'],
        [fn('SUM', col('countProcess')), 'totalProcesses'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'uniqueUsers']
      ],
      raw: true
    }) as unknown as TotalsResult | null;

    // Obtener datos agrupados por día
    const dailyData = await Count.findAll({
      where: whereClause,
      attributes: [
        'dateSave',
        [fn('SUM', col('countPlay')), 'plays'],
        [fn('SUM', col('countDownload')), 'downloads'],
        [fn('SUM', col('countProcess')), 'processes'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'users']
      ],
      group: ['dateSave'],
      order: [['dateSave', 'ASC']],
      raw: true
    }) as unknown as DailyDataResult[];

    // Top usuarios
    const topUsers = await Count.findAll({
      where: whereClause,
      attributes: [
        'username',
        [fn('SUM', col('countPlay')), 'totalPlays'],
        [fn('SUM', col('countDownload')), 'totalDownloads'],
        [fn('SUM', col('countProcess')), 'totalProcesses']
      ],
      group: ['username'],
      order: [[literal('SUM("countDownload")'), 'DESC']],
      limit: 10,
      raw: true
    }) as unknown as TopUserResult[];

    res.json({
      period,
      daysAnalyzed: daysBack,
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      totals: {
        plays: parseInt(totals?.totalPlays || '0'),
        downloads: parseInt(totals?.totalDownloads || '0'),
        processes: parseInt(totals?.totalProcesses || '0'),
        uniqueUsers: parseInt(totals?.uniqueUsers || '0')
      },
      dailyData,
      topUsers
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtiene métricas detalladas por día de TODOS los usuarios
 * Últimos 30 días máximo
 */
export const getDailyMetrics = async (req: Request, res: Response) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const whereClause: any = {
      dateSave: { [Op.gte]: startDate }
    };

    const dailyMetrics = await Count.findAll({
      where: whereClause,
      attributes: [
        'dateSave',
        [fn('SUM', col('countPlay')), 'plays'],
        [fn('SUM', col('countDownload')), 'downloads'],
        [fn('SUM', col('countProcess')), 'processes'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'activeUsers']
      ],
      group: ['dateSave'],
      order: [['dateSave', 'DESC']],
      raw: true
    });

    res.json({
      period: 'daily',
      data: dailyMetrics.map((day: any) => ({
        date: day.dateSave,
        plays: parseInt(day.plays || '0'),
        downloads: parseInt(day.downloads || '0'),
        processes: parseInt(day.processes || '0'),
        activeUsers: parseInt(day.activeUsers || '0')
      }))
    });
  } catch (error) {
    console.error('Error getting daily metrics:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas diarias',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtiene métricas agrupadas por semana de TODOS los usuarios
 * Últimos 30 días (aproximadamente 4 semanas)
 */
export const getWeeklyMetrics = async (req: Request, res: Response) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const whereClause: any = {
      dateSave: { [Op.gte]: startDate }
    };

    // Agrupar por semana usando EXTRACT(WEEK FROM dateSave)
    const weeklyMetrics = await Count.findAll({
      where: whereClause,
      attributes: [
        [fn('DATE_TRUNC', 'week', col('dateSave')), 'weekStart'],
        [fn('SUM', col('countPlay')), 'plays'],
        [fn('SUM', col('countDownload')), 'downloads'],
        [fn('SUM', col('countProcess')), 'processes'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'activeUsers']
      ],
      group: [fn('DATE_TRUNC', 'week', col('dateSave'))],
      order: [[fn('DATE_TRUNC', 'week', col('dateSave')), 'DESC']],
      raw: true
    });

    res.json({
      period: 'weekly',
      data: weeklyMetrics.map((week: any) => ({
        weekStart: week.weekStart,
        plays: parseInt(week.plays || '0'),
        downloads: parseInt(week.downloads || '0'),
        processes: parseInt(week.processes || '0'),
        activeUsers: parseInt(week.activeUsers || '0')
      }))
    });
  } catch (error) {
    console.error('Error getting weekly metrics:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas semanales',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtiene métricas agrupadas por mes de TODOS los usuarios
 * Último mes
 */
export const getMonthlyMetrics = async (req: Request, res: Response) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const whereClause: any = {
      dateSave: { [Op.gte]: startDate }
    };

    const monthlyMetrics = await Count.findAll({
      where: whereClause,
      attributes: [
        [fn('DATE_TRUNC', 'month', col('dateSave')), 'monthStart'],
        [fn('SUM', col('countPlay')), 'plays'],
        [fn('SUM', col('countDownload')), 'downloads'],
        [fn('SUM', col('countProcess')), 'processes'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'activeUsers']
      ],
      group: [fn('DATE_TRUNC', 'month', col('dateSave'))],
      order: [[fn('DATE_TRUNC', 'month', col('dateSave')), 'DESC']],
      raw: true
    });

    res.json({
      period: 'monthly',
      data: monthlyMetrics.map((month: any) => ({
        monthStart: month.monthStart,
        plays: parseInt(month.plays || '0'),
        downloads: parseInt(month.downloads || '0'),
        processes: parseInt(month.processes || '0'),
        activeUsers: parseInt(month.activeUsers || '0')
      }))
    });
  } catch (error) {
    console.error('Error getting monthly metrics:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas mensuales',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtiene métricas detalladas de un usuario específico
 * Query params:
 * - username: nombre del usuario (requerido)
 * - period: 'day' | 'week' | 'month' (default: 'month')
 */
export const getUserMetrics = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const { period = 'month' } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username es requerido' });
    }

    const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Totales del usuario
    const userTotals = await Count.findOne({
      where: {
        username,
        dateSave: { [Op.gte]: startDate }
      },
      attributes: [
        [fn('SUM', col('countPlay')), 'totalPlays'],
        [fn('SUM', col('countDownload')), 'totalDownloads'],
        [fn('SUM', col('countProcess')), 'totalProcesses'],
        [fn('COUNT', col('dateSave')), 'activeDays']
      ],
      raw: true
    }) as unknown as UserTotalsResult | null;

    // Actividad diaria del usuario
    const dailyActivity = await Count.findAll({
      where: {
        username,
        dateSave: { [Op.gte]: startDate }
      },
      attributes: [
        'dateSave',
        'countPlay',
        'countDownload',
        'countProcess'
      ],
      order: [['dateSave', 'DESC']],
      raw: true
    });

    // Ranking del usuario (posición en descargas)
    const allUsersRanking = await Count.findAll({
      where: {
        dateSave: { [Op.gte]: startDate }
      },
      attributes: [
        'username',
        [fn('SUM', col('countDownload')), 'totalDownloads']
      ],
      group: ['username'],
      order: [[literal('SUM("countDownload")'), 'DESC']],
      raw: true
    }) as unknown as UserRankingResult[];

    const userRank = allUsersRanking.findIndex((u) => u.username === username) + 1;

    // Promedios
    const avgPerDay = {
      plays: userTotals?.totalPlays ? parseInt(userTotals.totalPlays) / daysBack : 0,
      downloads: userTotals?.totalDownloads ? parseInt(userTotals.totalDownloads) / daysBack : 0,
      processes: userTotals?.totalProcesses ? parseInt(userTotals.totalProcesses) / daysBack : 0
    };

    res.json({
      username,
      period,
      daysAnalyzed: daysBack,
      totals: {
        plays: parseInt(userTotals?.totalPlays || '0'),
        downloads: parseInt(userTotals?.totalDownloads || '0'),
        processes: parseInt(userTotals?.totalProcesses || '0'),
        activeDays: parseInt(userTotals?.activeDays || '0')
      },
      averages: {
        playsPerDay: Math.round(avgPerDay.plays * 100) / 100,
        downloadsPerDay: Math.round(avgPerDay.downloads * 100) / 100,
        processesPerDay: Math.round(avgPerDay.processes * 100) / 100
      },
      ranking: {
        position: userRank,
        totalUsers: allUsersRanking.length
      },
      dailyActivity
    });
  } catch (error) {
    console.error('Error getting user metrics:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas del usuario',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Obtiene el top de usuarios por actividad
 * Query params:
 * - limit: número de usuarios a retornar (default: 10, max: 50)
 * - sortBy: 'downloads' | 'plays' | 'processes' (default: 'downloads')
 * - period: 'day' | 'week' | 'month' (default: 'month')
 */
export const getTopUsers = async (req: Request, res: Response) => {
  try {
    const { 
      limit = '10', 
      sortBy = 'downloads',
      period = 'month'
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string), 50);
    const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const sortColumn = sortBy === 'plays' ? 'countPlay' 
                     : sortBy === 'processes' ? 'countProcess' 
                     : 'countDownload';

    const topUsers = await Count.findAll({
      where: {
        dateSave: { [Op.gte]: startDate }
      },
      attributes: [
        'username',
        [fn('SUM', col('countPlay')), 'totalPlays'],
        [fn('SUM', col('countDownload')), 'totalDownloads'],
        [fn('SUM', col('countProcess')), 'totalProcesses'],
        [fn('COUNT', col('dateSave')), 'activeDays']
      ],
      group: ['username'],
      order: [[literal(`SUM("${sortColumn}")`), 'DESC']],
      limit: limitNum,
      raw: true
    });

    res.json({
      period,
      sortedBy: sortBy,
      topUsers: topUsers.map((user: any, index: number) => ({
        rank: index + 1,
        username: user.username,
        plays: parseInt(user.totalPlays || '0'),
        downloads: parseInt(user.totalDownloads || '0'),
        processes: parseInt(user.totalProcesses || '0'),
        activeDays: parseInt(user.activeDays || '0')
      }))
    });
  } catch (error) {
    console.error('Error getting top users:', error);
    res.status(500).json({ 
      error: 'Error al obtener top de usuarios',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};