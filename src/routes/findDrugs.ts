import { Request, Response } from "express";
import { prisma } from "../utilities/prisma";

interface Drug {
  drug_id: number;
  drug_name: string;
}

const findDrugs = async (req: Request, res: Response) => {
  const name = req.query.name;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const results = await prisma.$queryRaw<Drug[]>`
    select 
      drug_id,
      case when generic_name = brand_name then generic_name
      else generic_name || ' (' || brand_name || ')' end as drug_name
    from ( 
      select 
        drug_id,
        brand_name, 
        generic_name, 
        sum_fills, 
        similarity(brand_name, ${name}) as rnkb, 
        similarity(generic_name, ${name}) as rnkg 
      from prescription_rollup 
    ) q
    order by 
      case when rnkg * 2 > rnkb then rnkg * 2
      else rnkb end desc,
      sum_fills desc
    limit ${limit}
  `;
  res.send(results);
};

export default findDrugs;
