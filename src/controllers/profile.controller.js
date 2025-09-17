import {handleSuccess, handleErrorClient, handleErrorServer,} from '../Handlers/responseHandlers.js';
import { AppDataSource } from '../config/configDb.js';
import bcrypt from 'bcrypt';
import  User from '../entities/user.entity.js';

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, 'Perfil público obtenido exitosamente', {
    message: '¡Hola! Este es un perfil público. Cualquiera puede verlo.',
  });
}

export function getPrivateProfile(req, res) {
  const user = req.user;

  handleSuccess(res, 200, 'Perfil privado obtenido exitosamente', {
    message: `¡Hola, ${user.email}! Este es tu perfil privado. Solo tú puedes verlo.`,
    userData: user,
  });
}

export async function updateProfile(req, res) {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: req.user.id });

    if (!user) return handleErrorClient(res, 404, 'Usuario no encontrado');

    const { email, password } = req.body;
    if (!email && !password)
      return handleErrorClient(
        res,
        400,
        'Debes ingresar una contraseña y email valido para actualizar'
      );

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepo.save(user);
    handleSuccess(res, 200, 'Perfil actualizado', {
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    handleErrorServer(res, 500, 'Error al actualizar perfil', err.message);
  }
}

export async function deleteProfile(req, res) {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: req.user.id });

    if (!user) return handleErrorClient(res, 404, 'Usuario no encontrado');

    await userRepo.remove(user);

    handleSuccess(res, 200, 'Perfil eliminado', {
      id: req.user.id,
      email: req.user.email,
    });
  } catch (err) {
    handleErrorServer(res, 500, 'Error al eliminar perfil', err.message);
  }
}
