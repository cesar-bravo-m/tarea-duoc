INSERT INTO especialidad (nombre) VALUES ('Cardiologia');
INSERT INTO especialidad (nombre) VALUES ('Dermatologia');
INSERT INTO especialidad (nombre) VALUES ('Pediatria');
INSERT INTO especialidad (nombre) VALUES ('Neurologia');
INSERT INTO especialidad (nombre) VALUES ('Oftalmologia');
INSERT INTO especialidad (nombre) VALUES ('Traumatologia');
INSERT INTO especialidad (nombre) VALUES ('Psiquiatria');
INSERT INTO especialidad (nombre) VALUES ('Ginecologia');

-- Seed data for Funcionarios
INSERT INTO funcionario (rut, nombres, apellidos, telefono, email, password, especialidad_id) 
VALUES ('196450963', 'Juan', 'Perez', '+56912345678', 'juan.perez@hospital.cl', 'Abc123', 1);

INSERT INTO funcionario (rut, nombres, apellidos, telefono, email, password, especialidad_id) 
VALUES ('13538951k', 'Maria', 'Gonzalez', '+56987654321', 'maria.gonzalez@hospital.cl', 'Abc123', 2);

INSERT INTO funcionario (rut, nombres, apellidos, telefono, email, password, especialidad_id) 
VALUES ('145092035', 'Pedro', 'Rodriguez', '+56911111111', 'pedro.rodriguez@hospital.cl', 'Abc123', 3);

INSERT INTO funcionario (rut, nombres, apellidos, telefono, email, password, especialidad_id) 
VALUES ('199072412', 'Ana', 'Martinez', '+56922222222', 'ana.martinez@hospital.cl', 'Abc123', 4);

INSERT INTO funcionario (rut, nombres, apellidos, telefono, email, password, especialidad_id) 
VALUES ('151205682', 'Carlos', 'Sanchez', '+56933333333', 'carlos.sanchez@hospital.cl', 'Abc123', 5); 

INSERT INTO paciente (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) 
VALUES ('111111111', 'Laura', 'Silva', '+56944444444', 'laura.silva@email.com', '1990-05-15', 'F', 'Av. Principal 123');

INSERT INTO paciente (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) 
VALUES ('116726459', 'Diego', 'Torres', '+56955555555', 'diego.torres@email.com', '1985-08-22', 'M', 'Calle Central 456');

INSERT INTO paciente (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) 
VALUES ('170401697', 'Carmen', 'Lopez', '+56966666666', 'carmen.lopez@email.com', '1995-03-10', 'F', 'Pasaje Los Pinos 789');

INSERT INTO paciente (rut, nombres, apellidos, telefono, email, fecha_nacimiento, genero, direccion) 
VALUES ('171939747', 'Roberto', 'Muñoz', '+56977777777', 'roberto.munoz@email.com', '1982-11-30', 'M', 'Av. Los Robles 321'); 

-- Seed data for Rol
INSERT INTO rol (nombre) VALUES ('USA_CITAS');
INSERT INTO rol (nombre) VALUES ('USA_AGENDA');
INSERT INTO rol (nombre) VALUES ('USA_INSCRIPCION');

-- Assign roles to funcionarios
INSERT INTO funcionario_rol (funcionario_id, rol_id) VALUES (1, 1); -- USA_CITAS
INSERT INTO funcionario_rol (funcionario_id, rol_id) VALUES (1, 2); -- USA_AGENDA
INSERT INTO funcionario_rol (funcionario_id, rol_id) VALUES (1, 3); -- USA_INSCRIPCION

INSERT INTO funcionario_rol (funcionario_id, rol_id) VALUES (2, 2); -- USA_AGENDA
INSERT INTO funcionario_rol (funcionario_id, rol_id) VALUES (2, 3); -- USA_INSCRIPCION