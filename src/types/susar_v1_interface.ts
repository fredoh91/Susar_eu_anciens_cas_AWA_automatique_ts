export interface User {
    evaluateur: string;
  }

// Interface pour représenter un objet avec un évaluateur
export interface Evaluateur {
    evaluateur: string;
  }
  
  // Interface pour représenter la structure complète des données
export interface EvaluateursData {
    data: Evaluateur[];
    statement: string;
    parameters: any[];
    return: any;
    count: number;
    columns: {
      name: string;
      dataType: number;
      dataTypeName: string;
      columnSize: number;
      decimalDigits: number;
      nullable: boolean;
    }[];
  }



export interface CTLL {
    idCTLL:number;
    EV_SafetyReportIdentifier:string;
  }
