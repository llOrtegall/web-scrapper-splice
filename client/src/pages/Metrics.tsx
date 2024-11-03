import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { ChartColumn } from "lucide-react";
import { useEffect, useState } from "react";

interface CountInt {
  totalPlays: string,
  totalDownloads: string,
  totaProcess: string
  uniqueUser: string
}

interface DataGeneralMetrics {
  metricsMonthAnt: {
    counts: CountInt[];
    rango: string[];
  };
  metricsMonthAct: {
    counts: CountInt;
    rango: string[];
  };
}

export const MetricsComponent = () => {
  const [data, setData] = useState<DataGeneralMetrics | undefined>(undefined)

  useEffect(() => {
    axios.get('/metrics/general')
      .then(res => setData(res.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <section className="p-8">
      <CardHeader className="pt-6">
        <section className="flex items-center gap-1">
          <ChartColumn />
          <CardTitle>
            Resumen Global Mensual
          </CardTitle>
        </section>
        <p className="text-gray-400">
          Consolidado Mensual de uso general mes actual y anterior
        </p>

      </CardHeader>

      <Card>
        <CardTitle>
          {

          }
        </CardTitle>
      </Card>
    </section>
  );
};
