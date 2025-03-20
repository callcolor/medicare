import { Request, Response } from "express";
import { prisma } from "../utilities/prisma";
import { Prisma } from "@prisma/client";

const findPrescriber = async (req: Request, res: Response) => {
  const drugs = req.query.drug?.map?.(Number) ?? [];
  const lat = Number(req.query.lat);
  const long = Number(req.query.long);
  const distance = req.query.distance ? Number(req.query.distance) : 10;

  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const page = req.query.page ? Number(req.query.page) : 1;

  const latMin = lat - distance / 69.1;
  const latMax = lat + distance / 69.1;
  const longMin = long - (distance / 69.1) * Math.cos(lat / 57.3);
  const longMax = long + (distance / 69.1) * Math.cos(lat / 57.3);

  const results = await prisma.$queryRaw<unknown[]>`
    select       
      p.*,
      distance(p.latitude, p.longitude, ${lat}, ${long}) as distance,
      sum(sc.tot_30day_fills)::int4 as fills
    from prescriber p 
    left join prescriptions sc on sc.npi = p.npi 
    where 1=1
      and p.latitude > ${latMin}
      and p.latitude < ${latMax}
      and p.longitude > ${longMin}
      and p.longitude < ${longMax}
      and distance(p.latitude, p.longitude, ${lat}, ${long}) < ${distance}
      and sc.drug_id in (${Prisma.join(drugs)})
    group by p.npi
    order by sum(sc.tot_30day_fills) desc
    limit ${limit} offset ${(page - 1) * limit}
    ;
  `;

  res.send(results);
};

export default findPrescriber;
