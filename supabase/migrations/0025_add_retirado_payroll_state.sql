-- Agrega el estado 'Retirado' al enum payroll_state para el módulo de personal retirado
ALTER TYPE public.payroll_state ADD VALUE IF NOT EXISTS 'Retirado';
