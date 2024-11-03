import { Response, Request } from 'express'
import { Count } from '../models/count.m.js'
import { col, fn, Op } from 'sequelize';

export const getGeneralMetrics = async (req: Request, res: Response) => {
  const yearActual = new Date().getFullYear();
  const monthActual = new Date().getMonth();

  const firtsDay = new Date(yearActual, monthActual, 1).toISOString().split('T')[0]!;
  const lastDay = new Date(yearActual, monthActual + 1, 0).toISOString().split('T')[0]!;

  const firtsDayMonthAnt = new Date(yearActual, monthActual - 1, 1).toISOString().split('T')[0]!;
  const lastDayMonthAnt = new Date(yearActual, monthActual, 0).toISOString().split('T')[0]!;

  try {
    const metricsMonthActual = await Count.findAll({
      attributes: [
        [fn('SUM', col('countPlay')), 'totalPlays'],
        [fn('SUM', col('countDownload')), 'totalDownloads'],
        [fn('SUM', col('countProcess')), 'totaProcess'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'uniqueUsers']
      ],
      where: {
        dateSave: {
          [Op.between]: [firtsDay, lastDay]
        }
      }
    })

    const metricsMonthAnt = await Count.findAll({
      attributes: [
        [fn('SUM', col('countPlay')), 'totalPlays'],
        [fn('SUM', col('countDownload')), 'totalDownloads'],
        [fn('SUM', col('countProcess')), 'totaProcess'],
        [fn('COUNT', fn('DISTINCT', col('username'))), 'uniqueUsers']
      ],
      where: {
        dateSave: {
          [Op.between]: [firtsDayMonthAnt, lastDayMonthAnt]
        }
      }
    })

    const sendData = {
      metricsMonthAnt : {
        counts: metricsMonthAnt[0],
        rango: [firtsDayMonthAnt, lastDayMonthAnt]
      },
      metricsMonthAct: {
        counts: metricsMonthActual[0],
        rango: [firtsDay, lastDay]
      }
    }

    res.status(200).json(sendData)
  } catch (error) {
    res.status(500).json('fail')
  }

}