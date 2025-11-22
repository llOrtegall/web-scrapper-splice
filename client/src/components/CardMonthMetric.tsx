import { Activity, Calendar, DotIcon, Download, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DetailsByUsers } from "./DetailsByUsers";

interface CountInt {
  totalPlays: number;
  totalDownloads: number;
  totalProcess: number;
  uniqueUsers: number;
}

interface Props {
  loading: boolean,
  dateStart: string,
  dateFinal: string,
  counts: CountInt
}

export function CardMontMetric({ dateFinal, dateStart, loading, counts }: Props) {

  return (
    <Card className="px-4 mx-4 relative">
      <CardHeader>
        <article className="flex items-center gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Calendar />
            <p>Rango Fechas</p>
          </CardTitle>
          <DotIcon />
          <p>{loading ? 'Cargando...' : `${dateStart} — ${dateFinal}`}</p>
        </article>

        <p className="text-gray-400">
          {loading ? '—' : `${counts.uniqueUsers} Usuarios activos`}
        </p>

        <figure className="absolute right-2 top-2">
          <DetailsByUsers initialDate={dateStart} finalDate={dateFinal}/>
        </figure>
      </CardHeader>

      <Separator />
      <section className="flex px-6 justify-around py-4">
        <div className="text-center">
          <figure className="flex gap-2 justify-center items-center">
            <PlayCircle className="text-green-500" />
            <h1 className="font-semibold">Reproducciones</h1>
          </figure>
          <p className="text-2xl font-bold">
            {loading ? '—' : counts.totalPlays}
          </p>
        </div>
        <div className="text-center">
          <figure className="flex gap-2 justify-center items-center">
            <Download className="text-blue-600" />
            <h1 className="font-semibold">Descargas</h1>
          </figure>
          <p className="text-2xl font-bold">
            {loading ? '—' : counts.totalDownloads}
          </p>
        </div>
        <div className="text-center">
          <figure className="flex gap-2 justify-center items-center">
            <Activity className="text-purple-500" />
            <h1 className="font-semibold">Procesos</h1>
          </figure>
          <p className="text-2xl font-bold">
            {loading ? '—' : counts.totalProcess}
          </p>
        </div>
      </section>
    </Card>
  )
}