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

    // Enviar el buffer binario
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("Error en proxy S3:", error);
    res.status(500).send("Error en proxy S3");
  }
};