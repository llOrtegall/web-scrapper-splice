import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import axios from "axios"
import { useState } from "react"

interface Props {
  initialDate: string,
  finalDate: string
}

interface DataUsageUser {
  username: string,
  totalPlays: string
  totalDownloads: string
  totalProcess: string
}

export function DetailsByUsers({ finalDate, initialDate }: Props) {
  const [dataUsage, setDataUsage] = useState<DataUsageUser[] | null>(null)

  const handleOpenDetails = () => {
    axios.post('/metrics/monthUsers', { firtsDate: initialDate, finalDate })
      .then(res => {
        setDataUsage(res.data)
      })
      .catch(err => console.log(err))
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" onClick={handleOpenDetails}>Ver Detallado Usuarios</Button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="px-64">
          <DrawerHeader>
            <DrawerTitle>Detallado Usuario</DrawerTitle>
            <DrawerDescription>En esta sección se mostrará el uso de los diferentes servicios prestados por splice downloader con base al mes seleccionado anteriormente</DrawerDescription>
          </DrawerHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="">Nombre Usuario</TableHead>
                <TableHead>Reproducciones</TableHead>
                <TableHead>Descargas</TableHead>
                <TableHead>Procesados</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {
                dataUsage?.map(d => (
                  <TableRow>
                    <TableCell className="font-medium">{d.username}</TableCell>
                    <TableCell>{d.totalPlays}</TableCell>
                    <TableCell>{d.totalDownloads}</TableCell>
                    <TableCell>{d.totalProcess}</TableCell>
                    <TableCell className="text-right">
                      {parseInt(d.totalPlays) + parseInt(d.totalDownloads) + parseInt(d.totalProcess)}
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>


          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-40">Cerrar</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer >
  )
}
