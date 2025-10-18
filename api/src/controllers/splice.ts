import { UserPayLoad } from "../middlewares/authToken.js";
import { decodeSpliceAudio } from "../utils/decode.js";
import { convertAudio } from "../services/ffmpeg.js";
import { Count } from "../models/count.m.js";
import { Request, Response } from "express";

export const searchSpliceGraphQL = async (req: Request, res: Response) => {
  try {
    const response = await fetch("https://surfaces-graphql.splice.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "https://splice.com",
        "Referer": "https://splice.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error en proxy GraphQL:", error);
    res.status(500).json({ error: "Error en proxy GraphQL" });
  }
};

export const proxyS3 = async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {

    const response = await fetch(url, {
      headers: {
        "Origin": "https://splice.com",
        "Referer": "https://splice.com/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Error fetching S3 file");
    }

    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    // Registrar la descarga en la base de datos
    if (req.user && typeof req.user === 'object') {
      const userData = req.user as UserPayLoad

      await Count.sync();
      const nowDate = new Date();
      const existReg = await Count.findOne({
        where: {
          username: userData.username,
          dateSave: nowDate
        }
      })

      if (existReg === null) {
        await Count.create({
          username: userData.username,
          countPlay: 1
        })
      } else {
        const updateCount = existReg.dataValues.countPlay + 1

        await Count.update(
          { countPlay: updateCount },
          {
            where: {
              username: userData.username
            }
          }
        )
      }
    }

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error en proxy S3:", error);
    res.status(500).send("Error en proxy S3");
  }
};

export const processAudio = async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }
  try {
    const response = await fetch(url, {
      headers: {
        "Origin": "https://splice.com",
        "Referer": "https://splice.com/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Error fetching S3 file");
    }

    const buffer = await response.arrayBuffer();
    const encodedData = new Uint8Array(buffer);
    const decodedData = decodeSpliceAudio(encodedData);

    try {
      const wavBuffer = await convertAudio(decodedData);

      // Registrar la descarga en la base de datos
      if (req.user && typeof req.user === 'object') {
        const userData = req.user as UserPayLoad

        await Count.sync();
        const nowDate = new Date();
        const existReg = await Count.findOne({
          where: {
            username: userData.username,
            dateSave: nowDate
          }
        })

        if (existReg === null) {
          await Count.create({
            username: userData.username,
            countDownload: 1
          })
        } else {
          const updateCount = existReg.dataValues.countDownload + 1

          await Count.update(
            { countDownload: updateCount },
            {
              where: {
                username: userData.username
              }
            }
          )
        }
      }

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', 'attachment; filename="sample.wav"');
      res.send(wavBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error converting audio");
    }
  } catch (error) {
    res.status(500).send("Error processing audio");
  }
}