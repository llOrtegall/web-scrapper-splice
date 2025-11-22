import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChartColumn } from "lucide-react";
import { CardMontMetric } from "@/components/CardMonthMetric";

interface CountInt {
  totalPlays: number;
  totalDownloads: number;
  totalProcess: number;
  uniqueUsers: number;
}

interface DataGeneralMetrics {
  metricsMonthAnt: {
    counts: CountInt;
    rango: string[];
  };
  metricsMonthAct: {
    counts: CountInt;
    rango: string[];
  };
}



export const MetricsComponent = () => {
  const [data, setData] = useState<DataGeneralMetrics | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axios.get('/metrics/general')
      .then(res => setData(res.data))
      .catch(err => console.error('metrics fetch error', err))
      .finally(() => setLoading(false))
  }, [])


  return (
    <Card>
      <CardHeader className="pt-6">
        <section className="flex items-center gap-1">
          <ChartColumn />
          <div>
            <CardTitle className="text-lg md:text-xl">Resumen Global Mensual</CardTitle>
          </div>
        </section>
        <p className="text-gray-400">
          Consolidado Mensual de uso general mes actual y anterior
        </p>

      </CardHeader>

      <CardMontMetric
        dateStart={data?.metricsMonthAct.rango[0]!}
        dateFinal={data?.metricsMonthAct.rango[1]!}
        counts={data?.metricsMonthAct.counts!}
        loading={loading}
      />

      <CardMontMetric
        dateStart={data?.metricsMonthAnt.rango[0]!}
        dateFinal={data?.metricsMonthAnt.rango[1]!}
        counts={data?.metricsMonthAnt.counts!}
        loading={loading}
      />

    </Card>
  );
};
