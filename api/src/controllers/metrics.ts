import { Response, Request } from 'express'
import { Count } from '../models/count.m.js'
import { col, fn, Op } from 'sequelize';

type RawMetrics = Record<string, string | number | null> | null;

const formatYMD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const monthRange = (year: number, monthZeroBased: number): [string, string] => {
  const first = new Date(year, monthZeroBased, 1);
  const last = new Date(year, monthZeroBased + 1, 0);
  return [formatYMD(first), formatYMD(last)];
}

const ATTRIBUTES = [
  [fn('SUM', col('countPlay')), 'totalPlays'],
  [fn('SUM', col('countDownload')), 'totalDownloads'],
  [fn('SUM', col('countProcess')), 'totalProcess'],
  [fn('COUNT', fn('DISTINCT', col('username'))), 'uniqueUsers']
];

const normalize = (row: RawMetrics) => ({
  totalPlays: Number(row?.totalPlays ?? 0),
  totalDownloads: Number(row?.totalDownloads ?? 0),
  totalProcess: Number(row?.totalProcess ?? 0),
  uniqueUsers: Number(row?.uniqueUsers ?? 0)
});

export const getGeneralMetrics = async (req: Request, res: Response) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  const [startThisMonth, endThisMonth] = monthRange(year, month);
  const [startPrevMonth, endPrevMonth] = monthRange(year, month - 1);

  try {
    // Run both aggregated queries in parallel for better performance
    const [thisMonthRes, prevMonthRes] = await Promise.all([
      Count.findOne({ attributes: ATTRIBUTES as any, where: { dateSave: { [Op.between]: [startThisMonth, endThisMonth] } }, raw: true }),
      Count.findOne({ attributes: ATTRIBUTES as any, where: { dateSave: { [Op.between]: [startPrevMonth, endPrevMonth] } }, raw: true })
    ]);

    const thisMonthRaw = thisMonthRes as unknown as RawMetrics;
    const prevMonthRaw = prevMonthRes as unknown as RawMetrics;

    const sendData = {
      metricsMonthAnt: {
        counts: normalize(prevMonthRaw),
        rango: [startPrevMonth, endPrevMonth]
      },
      metricsMonthAct: {
        counts: normalize(thisMonthRaw),
        rango: [startThisMonth, endThisMonth]
      }
    }

    return res.status(200).json(sendData);
  } catch (error) {
    console.error('getGeneralMetrics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export const getUsersMonthMetrics = async (req: Request, res: Response) => {
  const firtsDate = req.body.firtsDate as string;
  const finalDate = req.body.finalDate as string;

  if (!firtsDate || !finalDate) {
    res.status(400).send('firtsDate and finalDate are required')
    return
  } else {
    try {
      const test = await Count.findAll({
        attributes: [
          'username',
          [fn('SUM', col('countPlay')), 'totalPlays'],
        ],
        where: {
          dateSave: {
            [Op.between]: [firtsDate, finalDate]
          }
        },
        group: ['username']
      })

      res.status(200).json(test)
    } catch (error) {
      console.log(error);
      res.status(500).send('fail')
    }
  }

}