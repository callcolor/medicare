import { createReadStream } from "fs";
import Papa from "papaparse";
import { prisma } from "./src/prisma";

interface Row {
  Prscrbr_NPI: string;
  Prscrbr_Last_Org_Name: string;
  Prscrbr_First_Name: string;
  Prscrbr_City: string;
  Prscrbr_State_Abrvtn: string;
  Prscrbr_State_FIPS: string;
  Prscrbr_Type: string;
  Prscrbr_Type_Src: string;
  Brnd_Name: string;
  Gnrc_Name: string;
  Tot_Clms: string;
  Tot_30day_Fills: string;
  Tot_Day_Suply: string;
  Tot_Drug_Cst: string;
  Tot_Benes: string;
}

const main = async () => {
  const file = createReadStream(
    "./medicare/Medicare Part D Prescribers - by Provider and Drug/2022/MUP_DPR_RY24_P04_V10_DY22_NPIBN.csv"
  );
  Papa.parse(file, {
    header: true,
    step: async (result, parser) => {
      const data = result.data as Row;
      console.log(data.Brnd_Name);
      parser.pause();

      await prisma.prescriber.upsert({
        where: { npi: data.Prscrbr_NPI },
        create: {
          npi: data.Prscrbr_NPI,
          last_name: data.Prscrbr_Last_Org_Name,
          first_name: data.Prscrbr_First_Name,
          org_name: data.Prscrbr_Last_Org_Name,
          city: data.Prscrbr_City,
          state: data.Prscrbr_State_Abrvtn,
          specialty_type: data.Prscrbr_Type,
        },
        update: {
          npi: data.Prscrbr_NPI,
          last_name: data.Prscrbr_Last_Org_Name,
          first_name: data.Prscrbr_First_Name,
          org_name: data.Prscrbr_Last_Org_Name,
          city: data.Prscrbr_City,
          state: data.Prscrbr_State_Abrvtn,
          specialty_type: data.Prscrbr_Type,
        },
      });

      await prisma.drug.upsert({
        where: {
          npi_brand_name_generic_name: {
            npi: data.Prscrbr_NPI,
            brand_name: data.Brnd_Name,
            generic_name: data.Gnrc_Name,
          },
        },
        create: {
          npi: data.Prscrbr_NPI,
          brand_name: data.Brnd_Name,
          generic_name: data.Gnrc_Name,
          tot_benes: data.Tot_Benes ? Number(data.Tot_Benes) : null,
          tot_claims: data.Tot_Clms ? Number(data.Tot_Clms) : null,
          tot_30day_fills: data.Tot_30day_Fills
            ? Number(data.Tot_30day_Fills)
            : null,
          tot_day_supply: data.Tot_Day_Suply
            ? Number(data.Tot_Day_Suply)
            : null,
        },
        update: {
          npi: data.Prscrbr_NPI,
          brand_name: data.Brnd_Name,
          generic_name: data.Gnrc_Name,
          tot_benes: data.Tot_Benes ? Number(data.Tot_Benes) : null,
          tot_claims: data.Tot_Clms ? Number(data.Tot_Clms) : null,
          tot_30day_fills: data.Tot_30day_Fills
            ? Number(data.Tot_30day_Fills)
            : null,
          tot_day_supply: data.Tot_Day_Suply
            ? Number(data.Tot_Day_Suply)
            : null,
        },
      });

      parser.resume();
    },
  });
};

main();
