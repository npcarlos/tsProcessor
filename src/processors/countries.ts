import * as fs from "fs";

export function main(args?: any) {}

export function processJsonFile(filePath: string): any {
  processAllergiesJsonFile();
}
export function processAllergiesJsonFile(): any {
  const data_origin: any = JSON.parse(
    fs.readFileSync("./data/demographics/allergies.json", "utf-8")
  );
  data_origin.forEach((allergy: any) => {
    Object.keys(allergy.i18n).forEach((lang) => {
      allergy.i18n[lang] = { name: allergy.i18n[lang] };
    });
  });
  fs.writeFileSync(
    "./data/demographics/allergies_full.json",
    JSON.stringify(data_origin, null, 2),
    "utf-8"
  );
}
export function processCountriesJsonFile(): any {
  const data_origin: any = JSON.parse(
    fs.readFileSync("./data/geo/countries.json", "utf-8")
  );

  console.log(
    data_origin
      .filter((country: any) => !country.nameTranslations)
      .map((country: any) => country.name)
  );

  let str = "";
  const compiled = data_origin.map((element: any, index: number) => {
    if (!element.nameTranslations) {
      console.log(element.name);
    }
    const origin = element;
    origin.i18n = {};

    Object.keys(origin.nameTranslations).forEach((lang) => {
      origin.i18n[lang] = { name: origin.nameTranslations[lang] };
    });
    origin.nameTranslations = undefined;
    // console.log(origin.i18n);
    return { ...origin };
  });

  console.log(str);

  fs.writeFileSync(
    "./data/geo/countries_full.json",
    JSON.stringify(compiled, null, 2),
    "utf-8"
  );
}
export function processLanguagesJsonFile(): any {
  const data_origin: any = JSON.parse(
    fs.readFileSync("./data/geo/languages.json", "utf-8")
  );
  const data__flags: any = JSON.parse(
    fs.readFileSync("./data/geo/lang_flags.json", "utf-8")
  );
  const data_i18n: any = JSON.parse(
    fs.readFileSync("./data/geo/lang_i18n_src.json", "utf-8")
  );

  console.log(
    Object.keys(data_origin).length,
    Object.keys(data__flags).length,
    Object.keys(data_i18n).length
  );
  let str = "";
  const compiled = Object.keys(data_origin).map((key, index) => {
    const origin = data_origin[key];
    const origin_flags = data__flags.find(
      (element: any) => element.key === key
    );
    if (!origin_flags) {
      str += key + ",";
    }

    const origin_i18n = data_i18n.find((element: any) => element.key === key);

    Object.keys(origin_i18n.i18n).forEach((lang) => {
      origin_i18n.i18n[lang] = { name: origin_i18n.i18n[lang] };
    });

    return { ...origin_flags, ...origin_i18n, ...origin };
  });
  console.log(str);

  console.log(Object.values(compiled).filter((lang) => !lang.main_flag_2));

  fs.writeFileSync(
    "./data/geo/lang_full.json",
    JSON.stringify(compiled, null, 2),
    "utf-8"
  );
}
export function processContinentsJsonFile(filePath: string): any {
  const data: any = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const short: any = Object.keys(data).map((key, index) => {
    return { key, name: data[key]["EN"], i18n: { ...data[key] } };
  });
  console.log(short);

  const jsonString = JSON.stringify(short, null, 2);
  fs.writeFileSync("./data/geo/continents_full.json", jsonString, "utf-8");
}
export function processCurrencyJsonFile(filePath: string): any {
  const data: any = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const dataI18N: any = JSON.parse(
    fs.readFileSync("./data/currencies_i18n.json", "utf-8")
  );

  const currencies = Object.values(data);

  const init = 170;

  const fin = init + 10;
  console.log(Object.keys(data).length);
  const short = Object.keys(data).map((currencyKey, index) => {
    const currency = data[currencyKey];
    return {
      ISO_4217_key: currencyKey,
      ...currency,
      i18n: dataI18N[currencyKey].i18n,
    };
  });
  const jsonString = JSON.stringify(short, null, 2);
  // console.log(jsonString);

  // // Escribe el archivo JSON
  fs.writeFileSync("./data/currencies_full_i18n.json", jsonString, "utf-8");
}
