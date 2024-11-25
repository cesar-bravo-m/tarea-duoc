import { Injectable } from '@angular/core';
import initSqlJs from 'sql.js';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export interface Especialidad {
  id: number;
  nombre: string;
}

export interface Funcionario {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
  telefono: string;
  email: string;
  password: string;
  esp_id: number;
  especialidad?: string; // UI
}

export interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
  telefono: string;
  email: string;
  fecha_nacimiento: string;
  genero: string;
  direccion: string;
}

export interface SegmentoHorario {
  id: number;
  nombre: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  fun_id: number;
  free: boolean;
}

enum Estado {
  DISPONIBLE = '0',
  OCUPADO = '1'
}

export interface Cupo {
  id: number;
  estado: Estado;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  duracion: number; // En minutos
}

export interface Cita {
  id: number;
  cup_id: number;
  pac_id: number;
}

export interface Rol {
  id: number;
  nombre: string;
}

export interface RolFuncionario {
  rol_id: number;
  fun_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;
  private especialidadesSubject = new BehaviorSubject<Especialidad[]>([]);
  private funcionariosSubject = new BehaviorSubject<Funcionario[]>([]);
  private pacientesSubject = new BehaviorSubject<Paciente[]>([]);
  private segmentosHorarioSubject = new BehaviorSubject<SegmentoHorario[]>([]);
  private cuposSubject = new BehaviorSubject<Cupo[]>([]);
  private citasSubject = new BehaviorSubject<Cita[]>([]);
  private rolesSubject = new BehaviorSubject<Rol[]>([]);
  private rolesFuncionarioSubject = new BehaviorSubject<RolFuncionario[]>([]);
  especialidades$ = this.especialidadesSubject.asObservable();
  funcionarios$ = this.funcionariosSubject.asObservable();
  pacientes$ = this.pacientesSubject.asObservable();
  segmentosHorario$ = this.segmentosHorarioSubject.asObservable();
  cupos$ = this.cuposSubject.asObservable();
  citas$ = this.citasSubject.asObservable();
  roles$ = this.rolesSubject.asObservable();
  rolesFuncionario$ = this.rolesFuncionarioSubject.asObservable();

  async initializeDatabase(): Promise<void> {
    try {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      this.db = new SQL.Database();
      
      this.db.run(`
        CREATE TABLE IF NOT EXISTS ESP_ESPECIALIDAD (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS FUN_FUNCIONARIO (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombres TEXT NOT NULL,
          apellidos TEXT NOT NULL,
          rut TEXT NOT NULL,
          telefono TEXT NOT NULL,
          email TEXT NOT NULL,
          password TEXT NOT NULL,
          esp_id INTEGER,
          FOREIGN KEY (esp_id) REFERENCES ESP_ESPECIALIDAD(id)
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS PAC_PACIENTE (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombres TEXT NOT NULL,
          apellidos TEXT NOT NULL,
          rut TEXT NOT NULL,
          telefono TEXT NOT NULL,
          email TEXT NOT NULL,
          fecha_nacimiento TEXT NOT NULL,
          genero TEXT NOT NULL,
          direccion TEXT NOT NULL
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS SGH_SEGMENTO_HORARIO (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          fecha_hora_inicio TEXT NOT NULL,
          fecha_hora_fin TEXT NOT NULL,
          fun_id INTEGER,
          free BOOLEAN NOT NULL,
          FOREIGN KEY (fun_id) REFERENCES FUN_FUNCIONARIO(id)
        )
      `);

      // Estados: 0: Disponible, 1: Ocupado
      this.db.run(`
        CREATE TABLE IF NOT EXISTS CUP_CUPO (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          estado TEXT NOT NULL,
          fecha_hora_inicio TEXT NOT NULL,
          fecha_hora_fin TEXT NOT NULL,
          duracion INTEGER NOT NULL,
          sgh_id INTEGER,
          FOREIGN KEY (sgh_id) REFERENCES SGH_SEGMENTO_HORARIO(id)
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS CIT_CITA (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cup_id INTEGER,
          pac_id INTEGER,
          FOREIGN KEY (cup_id) REFERENCES CUP_CUPO(id),
          FOREIGN KEY (pac_id) REFERENCES PAC_PACIENTE(id)
        )
      `);

      // Create roles table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS ROL_ROLES (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL UNIQUE
        )
      `);

      // Create role-funcionario relationship table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS RL_ROL_FUN (
          rol_id INTEGER,
          fun_id INTEGER,
          PRIMARY KEY (rol_id, fun_id),
          FOREIGN KEY (rol_id) REFERENCES ROL_ROLES(id),
          FOREIGN KEY (fun_id) REFERENCES FUN_FUNCIONARIO(id)
        )
      `);

      this.seedDatabase();
      this.loadEspecialidades();
      this.loadFuncionarios();
      this.loadPacientes();
      this.loadSegmentosHorario();
      this.loadCupos();
      this.loadCitas();
      this.seedRoles();
      this.loadRoles();
      this.loadRolesFuncionario();
    } catch (err) {
      throw new Error('Failed to initialize database');
    }
  }

  private async seedDatabase(): Promise<void> {
    const script = `
INSERT INTO ESP_ESPECIALIDAD (nombre) VALUES ('Cardiología');
INSERT INTO ESP_ESPECIALIDAD (nombre) VALUES ('Neurología');
INSERT INTO ESP_ESPECIALIDAD (nombre) VALUES ('Pediatría');
INSERT INTO ESP_ESPECIALIDAD (nombre) VALUES ('Dermatología');
INSERT INTO ESP_ESPECIALIDAD (nombre) VALUES ('Oncología');

INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('196450963', 'María', 'González', '555-1001', 'maria.gonzalez@ejemplo.com', 'contraseña123', 1);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('13538951k', 'José', 'Rodríguez', '555-1002', 'jose.rodriguez@ejemplo.com', 'contraseña123', 2);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('145092035', 'Carmen', 'López', '555-1003', 'carmen.lopez@ejemplo.com', 'contraseña123', 3);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('199072412', 'Luis', 'Martínez', '555-1004', 'luis.martinez@ejemplo.com', 'contraseña123', 4);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('151205682', 'Ana', 'García', '555-1005', 'ana.garcia@ejemplo.com', 'contraseña123', 5);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('195174571', 'Juan', 'Sánchez', '555-1006', 'juan.sanchez@ejemplo.com', 'contraseña123', 1);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('116726459', 'Laura', 'Pérez', '555-1007', 'laura.perez@ejemplo.com', 'contraseña123', 2);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('170401697', 'Carlos', 'Torres', '555-1008', 'carlos.torres@ejemplo.com', 'contraseña123', 3);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('171939747', 'Isabel', 'Ramírez', '555-1009', 'isabel.ramirez@ejemplo.com', 'contraseña123', 4);
INSERT INTO FUN_FUNCIONARIO (rut, nombres, apellidos, telefono, email, password, esp_id) VALUES ('198848395', 'Miguel', 'Flores', '555-1010', 'miguel.flores@ejemplo.com', 'contraseña123', 5);

INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('111111111', 'Diego', 'Castro', '555-2001', 'diego.castro@ejemplo.com', '1990-05-14', 'M', 'Calle Principal 123');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('222222222', 'Lucía', 'Morales', '555-2002', 'lucia.morales@ejemplo.com', '1985-08-23', 'F', 'Avenida Secundaria 456');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('333333333', 'Antonio', 'Vargas', '555-2003', 'antonio.vargas@ejemplo.com', '1978-12-02', 'M', 'Calle Tercera 789');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('444444444', 'Sofía', 'Ortega', '555-2004', 'sofia.ortega@ejemplo.com', '1992-07-19', 'F', 'Avenida Cuarta 321');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('555555555', 'Pedro', 'Ramos', '555-2005', 'pedro.ramos@ejemplo.com', '1980-03-11', 'M', 'Calle Quinta 654');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('666666666', 'Valentina', 'Mendoza', '555-2006', 'valentina.mendoza@ejemplo.com', '1995-09-30', 'F', 'Avenida Sexta 987');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('777777777', 'Andrés', 'Silva', '555-2007', 'andres.silva@ejemplo.com', '1975-11-05', 'M', 'Calle Séptima 159');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('888888888', 'Elena', 'Santos', '555-2008', 'elena.santos@ejemplo.com', '1988-04-22', 'F', 'Avenida Octava 753');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('999999999', 'Jorge', 'Cruz', '555-2009', 'jorge.cruz@ejemplo.com', '1993-06-17', 'M', 'Calle Novena 852');
INSERT INTO PAC_PACIENTE (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) VALUES ('101010101', 'Camila', 'Reyes', '555-2010', 'camila.reyes@ejemplo.com', '1991-01-28', 'F', 'Avenida Décima 951');
    `;
    this.db.run(script);
  }

  private seedRoles(): void {
    const roles = [
      'USA_CITAS',
      'USA_AGENDA',
      'USA_INSCRIPCION'
    ];

    roles.forEach(rol => {
      try {
        this.db.run('INSERT OR IGNORE INTO ROL_ROLES (nombre) VALUES (?)', [rol]);
      } catch (error) {
        console.error(`Error seeding role ${rol}:`, error);
      }
    });
    // Add all roles to funcionarios 1 to 10 
    for (let i = 1; i <= 10; i++) {
      this.db.run('INSERT OR IGNORE INTO RL_ROL_FUN (rol_id, fun_id) VALUES (?, ?)', [1, i]);
      this.db.run('INSERT OR IGNORE INTO RL_ROL_FUN (rol_id, fun_id) VALUES (?, ?)', [2, i]);
      this.db.run('INSERT OR IGNORE INTO RL_ROL_FUN (rol_id, fun_id) VALUES (?, ?)', [3, i]);
    }
  }

  public loadEspecialidades(): void {
    const result = this.db.exec('SELECT * FROM ESP_ESPECIALIDAD');
    if (result.length > 0) {
      this.especialidadesSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        nombre: row[1]
      })));
    } else {
      this.especialidadesSubject.next([]);
    }
  }

  public loadFuncionarios(): void {
    const result = this.db.exec(`
      SELECT FUN_FUNCIONARIO.*, ESP_ESPECIALIDAD.nombre AS especialidad
      FROM FUN_FUNCIONARIO
      LEFT JOIN ESP_ESPECIALIDAD ON FUN_FUNCIONARIO.esp_id = ESP_ESPECIALIDAD.id
    `);
    if (result.length > 0) {
      this.funcionariosSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        nombres: row[1],
        apellidos: row[2],
        rut: row[3],
        telefono: row[4],
        email: row[5],
        especialidad: row[8]
      })));
    }
  }

  public loadPacientes(): void {
    const result = this.db.exec('SELECT * FROM PAC_PACIENTE');
    if (result.length > 0) {
      this.pacientesSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        nombres: row[1],
        apellidos: row[2],
      })));
    }
  }

  public loadSegmentosHorario(): void {
    const result = this.db.exec('SELECT * FROM SGH_SEGMENTO_HORARIO');
    if (result.length > 0) {
      this.segmentosHorarioSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        nombre: row[1],
      })));
    }
  }

  public loadCupos(): void {
    const result = this.db.exec('SELECT * FROM CUP_CUPO');
    if (result.length > 0) {
      this.cuposSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        estado: row[1],
      })));
    }
  }

  public loadCitas(): void {
    const result = this.db.exec('SELECT * FROM CIT_CITA');
    if (result.length > 0) {
      this.citasSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        cup_id: row[1],
        pac_id: row[2],
      })));
    }
  }

  public loadRoles(): void {
    const result = this.db.exec('SELECT * FROM ROL_ROLES');
    if (result.length > 0) {
      this.rolesSubject.next(result[0].values.map((row: any) => ({
        id: row[0],
        nombre: row[1]
      })));
    }
  }

  public loadRolesFuncionario(): void {
    const result = this.db.exec('SELECT * FROM RL_ROL_FUN');
    if (result.length > 0) {
      this.rolesFuncionarioSubject.next(result[0].values.map((row: any) => ({
        rol_id: row[0],
        fun_id: row[1]
      })));
    }
  }

  public tryLogin(email: string, password: string): boolean {
    const result = this.db.exec(`SELECT * FROM FUN_FUNCIONARIO WHERE email = ? AND password = ?`, [email, password]);
    return result.length > 0 && result[0].values.length > 0;
  }

  public getFuncionarioByName(name: string): Funcionario | null {
    const result = this.db.exec(`
      SELECT FUN_FUNCIONARIO.*, ESP_ESPECIALIDAD.nombre AS especialidad
      FROM FUN_FUNCIONARIO
      LEFT JOIN ESP_ESPECIALIDAD ON FUN_FUNCIONARIO.esp_id = ESP_ESPECIALIDAD.id
      WHERE nombres LIKE ? OR apellidos LIKE ?`, [`%${name}%`, `%${name}%`]);
    return result.length > 0 && result[0].values.length > 0 ? result[0].values[0] : null;
  }

  public getFuncionarioById(id: number): Funcionario | null {
    // Get funcionario with especialidad name
    const result = this.db.exec(`
      SELECT FUN_FUNCIONARIO.*, ESP_ESPECIALIDAD.nombre AS especialidad
      FROM FUN_FUNCIONARIO
      LEFT JOIN ESP_ESPECIALIDAD ON FUN_FUNCIONARIO.esp_id = ESP_ESPECIALIDAD.id
      WHERE id = ?`, [id]);
    const funcionario: Funcionario | null = result.length > 0 && result[0].values.length > 0 ? result[0].values[0] : null;
    return funcionario;
  }

  public getFuncionarioByEmail(email: string): Funcionario | null {
    // Get funcionario with especialidad name
    const result = this.db.exec(`
      SELECT FUN_FUNCIONARIO.*, ESP_ESPECIALIDAD.nombre AS especialidad
      FROM FUN_FUNCIONARIO
      LEFT JOIN ESP_ESPECIALIDAD ON FUN_FUNCIONARIO.esp_id = ESP_ESPECIALIDAD.id
      WHERE email = ?`, [email]);
    const funcionario: Funcionario | null = result.length > 0 && result[0].values.length > 0 ? result[0].values[0] : null;
    return funcionario;
  }

  public addFuncionario(funcionario: Funcionario): void {
    // First add the funcionario
    this.db.run(`
      INSERT INTO FUN_FUNCIONARIO (nombres, apellidos, rut, telefono, email, password, esp_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        funcionario.nombres,
        funcionario.apellidos,
        funcionario.rut,
        funcionario.telefono,
        funcionario.email,
        funcionario.password,
        funcionario.esp_id
      ]
    );

    // Get the id of the newly inserted funcionario
    const result = this.db.exec(`
      SELECT id FROM FUN_FUNCIONARIO 
      WHERE rut = ?`, 
      [funcionario.rut]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      const funId = result[0].values[0][0];
      
      // Add all roles to the new funcionario
      this.db.run('INSERT INTO RL_ROL_FUN (rol_id, fun_id) VALUES (1, ?)', [funId]);
      this.db.run('INSERT INTO RL_ROL_FUN (rol_id, fun_id) VALUES (2, ?)', [funId]);
      this.db.run('INSERT INTO RL_ROL_FUN (rol_id, fun_id) VALUES (3, ?)', [funId]);
    }

    // Reload data
    this.loadFuncionarios();
    this.loadRolesFuncionario();
  }

  public addPaciente(paciente: Paciente): void {
    this.db.run(
      `INSERT INTO PAC_PACIENTE (nombres, apellidos, rut, telefono, email, fecha_nacimiento, genero, direccion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [
        paciente.nombres,
        paciente.apellidos,
        paciente.rut.replace(/\./g, '').replace('-', ''),
        paciente.telefono,
        paciente.email,
        paciente.fecha_nacimiento,
        paciente.genero,
        paciente.direccion
      ]
    );
    this.loadPacientes();
  }

  public getPacienteByRut(rut: string): Paciente | null {
    const result = this.db.exec(`SELECT * FROM PAC_PACIENTE WHERE rut = ?`, [rut.replace(/\./g, '').replace('-', '')]);
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      return {
        id: row[0],
        nombres: row[1],
        apellidos: row[2],
        rut: row[3],
        telefono: row[4],
        email: row[5],
        fecha_nacimiento: row[6],
        genero: row[7],
        direccion: row[8]
      } as Paciente;
    }
    return null;
  }

  public addSegmentoHorario(segmentoHorario: SegmentoHorario): void {
    console.log("### segmentoHorario: ", segmentoHorario);
    if (!segmentoHorario.nombre || !segmentoHorario.fecha_hora_inicio || !segmentoHorario.fecha_hora_fin || !segmentoHorario.fun_id) {
      return;
    }
    this.db.run(`INSERT INTO SGH_SEGMENTO_HORARIO (nombre, fecha_hora_inicio, fecha_hora_fin, fun_id, free) VALUES (?, ?, ?, ?, ?)`, [segmentoHorario.nombre, segmentoHorario.fecha_hora_inicio, segmentoHorario.fecha_hora_fin, segmentoHorario.fun_id, segmentoHorario.free]);
    const result = this.db.exec(`SELECT id FROM SGH_SEGMENTO_HORARIO WHERE nombre = ? AND fecha_hora_inicio = ? AND fecha_hora_fin = ? AND fun_id = ?`, [segmentoHorario.nombre, segmentoHorario.fecha_hora_inicio, segmentoHorario.fecha_hora_fin, segmentoHorario.fun_id]);
    const id = result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : null;
    const duration = (new Date(segmentoHorario.fecha_hora_fin).getTime() - new Date(segmentoHorario.fecha_hora_inicio).getTime()) / (30*60000);
    for (let i = 0; i < duration; i++) {
      this.db.run(`INSERT INTO CUP_CUPO (estado, fecha_hora_inicio, fecha_hora_fin, duracion, sgh_id) VALUES (?, ?, ?, ?, ?)`, ['Disponible', segmentoHorario.fecha_hora_inicio, segmentoHorario.fecha_hora_fin, duration, id]);
    }
    this.loadSegmentosHorario();
  }

  public getSegmentosHorarioByFuncionarioId(funcionarioId: number): SegmentoHorario[] {
    const result = this.db.exec(`SELECT * FROM SGH_SEGMENTO_HORARIO WHERE fun_id = ?`, [funcionarioId]);
    return result.length > 0 && result[0].values.length > 0 ? result[0].values.map((row: any) => ({
      id: row[0],
      nombre: row[1],
      fecha_hora_inicio: row[2],
      fecha_hora_fin: row[3],
      fun_id: row[4],
      free: row[5]
    })) : [];
  }

  public deleteSegmentoHorario(id: number): void {
    this.db.run(`DELETE FROM SGH_SEGMENTO_HORARIO WHERE id = ?`, [id]);
    this.loadSegmentosHorario();
  }

  public getSegmentoHorarioById(id: number): SegmentoHorario | null {
    const result = this.db.exec(`SELECT * FROM SGH_SEGMENTO_HORARIO WHERE id = ?`, [id]);
    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      return {
        id: row[0],
        nombre: row[1],
        fecha_hora_inicio: row[2],
        fecha_hora_fin: row[3],
        fun_id: row[4],
        free: row[5]
      } as SegmentoHorario;
    }
    return null;
  }

  public updateSegmentoHorario(segmentoHorario: SegmentoHorario): void {
    if (!segmentoHorario.nombre || !segmentoHorario.fecha_hora_inicio || !segmentoHorario.fecha_hora_fin || !segmentoHorario.id) {
      return;
    }
    this.db.run(`
      UPDATE SGH_SEGMENTO_HORARIO 
      SET nombre = ?, fecha_hora_inicio = ?, fecha_hora_fin = ?, free = ?
      WHERE id = ?
    `, [
      segmentoHorario.nombre,
      segmentoHorario.fecha_hora_inicio,
      segmentoHorario.fecha_hora_fin,
      segmentoHorario.id,
      segmentoHorario.free
    ]);

    // Update associated cupos
    const duration = (new Date(segmentoHorario.fecha_hora_fin).getTime() - new Date(segmentoHorario.fecha_hora_inicio).getTime()) / (30*60000);
    
    // First, delete existing cupos
    this.db.run(`DELETE FROM CUP_CUPO WHERE sgh_id = ?`, [segmentoHorario.id]);

    // Then, create new cupos
    for (let i = 0; i < duration; i++) {
      const cupoStart = new Date(segmentoHorario.fecha_hora_inicio);
      cupoStart.setMinutes(cupoStart.getMinutes() + (i * 30));
      const cupoEnd = new Date(cupoStart);
      cupoEnd.setMinutes(cupoEnd.getMinutes() + 30);

      this.db.run(`
        INSERT INTO CUP_CUPO (estado, fecha_hora_inicio, fecha_hora_fin, duracion, sgh_id) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'Disponible',
        cupoStart.toISOString(),
        cupoEnd.toISOString(),
        30,
        segmentoHorario.id
      ]);
    }

    this.loadSegmentosHorario();
  }
  public deleteFuncionario(id: number): void {
    this.db.run(`DELETE FROM FUN_FUNCIONARIO WHERE id = ?`, [id]);
    this.loadFuncionarios();
  }

  public assignRolToFuncionario(rolId: number, funId: number): void {
    this.db.run(
      'INSERT OR IGNORE INTO RL_ROL_FUN (rol_id, fun_id) VALUES (?, ?)',
      [rolId, funId]
    );
    this.loadRolesFuncionario();
  }

  public removeRolFromFuncionario(rolId: number, funId: number): void {
    this.db.run(
      'DELETE FROM RL_ROL_FUN WHERE rol_id = ? AND fun_id = ?',
      [rolId, funId]
    );
    this.loadRolesFuncionario();
  }

  public getFuncionarioRoles(funId: number): string[] {
    const result = this.db.exec(`
      SELECT r.nombre 
      FROM ROL_ROLES r 
      JOIN RL_ROL_FUN rf ON r.id = rf.rol_id 
      WHERE rf.fun_id = ?
    `, [funId]);

    return result.length > 0 ? result[0].values.map((row: any) => row[0]) : [];
  }

  public hasRole(funId: number, rolNombre: string): boolean {
    const result = this.db.exec(`
      SELECT 1 
      FROM ROL_ROLES r 
      JOIN RL_ROL_FUN rf ON r.id = rf.rol_id 
      WHERE rf.fun_id = ? AND r.nombre = ?
    `, [funId, rolNombre]);

    return result.length > 0 && result[0].values.length > 0;
  }

  public getFuncionarioByRut(rut: string): Funcionario | null {
    const result = this.db.exec(`
      SELECT FUN_FUNCIONARIO.*, ESP_ESPECIALIDAD.nombre AS especialidad
      FROM FUN_FUNCIONARIO
      LEFT JOIN ESP_ESPECIALIDAD ON FUN_FUNCIONARIO.esp_id = ESP_ESPECIALIDAD.id
      WHERE rut = ?`, [rut.replace(/\./g, '').replace('-', '')]);
    return result.length > 0 && result[0].values.length > 0 ? {
      id: result[0].values[0][0],
      nombres: result[0].values[0][1],
      apellidos: result[0].values[0][2],
      rut: result[0].values[0][3],
      telefono: result[0].values[0][4],
      email: result[0].values[0][5],
      password: result[0].values[0][6],
      esp_id: result[0].values[0][7],
      especialidad: result[0].values[0][8]
    } as Funcionario : null;
  }
}