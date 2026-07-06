export interface ProvinceData {
  cities: {
    [cityName: string]: string[];
  };
}

export const LOCATION_PRESETS: { [provinceName: string]: ProvinceData } = {
  "Metro Manila": {
    cities: {
      "Manila": ["Malate", "Ermita", "Sampaloc", "Intramuros", "Tondo", "Paco", "San Andres"],
      "Quezon City": ["Diliman", "Cubao", "Commonwealth", "Katipunan", "Loyola Heights", "New Manila", "Batasan Hills"],
      "Makati": ["Bel-Air", "Poblacion", "Guadalupe Nuevo", "Bangkal", "San Lorenzo", "Pio del Pilar", "Tejeros"],
      "Pasig": ["Ortigas Center", "Kapitolyo", "San Antonio", "Ugong", "Caniogan", "Maybunga", "Rosario"],
      "Taguig": ["BGC / Fort Bonifacio", "Ususan", "Wawa", "Pinagsama", "Hagonoy", "Tuktukan"]
    }
  },
  "Cebu": {
    cities: {
      "Cebu City": ["Lahug", "Mabolo", "Banilad", "Guadalupe", "Talamban", "Capitol Site", "Apas", "Labangon", "Tisa", "Sambag I", "Sambag II"],
      "Mandaue City": ["Bakilid", "Banilad", "Centro", "Subangdaku", "Tipolo", "Cabancalan", "Alang-alang", "Guizo", "Looc"],
      "Lapu-Lapu City": ["Basak", "Babag", "Mactan", "Gun-ob", "Marigondon", "Pajo", "Pusok", "Agus", "Bankal"],
      "Talisay City": ["Bulacao", "Dumlog", "Jaclupan", "Linao", "Tabunok", "Pooc", "San Roque", "Cansojong"]
    }
  },
  "Davao": {
    cities: {
      "Davao City": ["Buhangin", "Talomo", "Agdao", "Toril", "Poblacion", "Calinan", "Bunawan", "Matina Crossing"]
    }
  }
};
