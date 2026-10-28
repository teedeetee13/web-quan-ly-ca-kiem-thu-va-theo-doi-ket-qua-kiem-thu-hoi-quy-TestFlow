import * as bcrypt from 'bcryptjs';

/** Chi phí băm bcrypt: 10 vòng (2^10 lần lặp), cân bằng giữa an toàn và tốc độ demo. */
const SALT_ROUNDS = 10;

/** Quy tắc mật khẩu: 8–72 ký tự, có cả chữ và số. */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/;
export const PASSWORD_MESSAGE = 'Mật khẩu từ 8–72 ký tự, gồm cả chữ và số';

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
