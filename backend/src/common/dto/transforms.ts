/** Dùng với @Transform: cắt khoảng trắng hai đầu để "   " bị coi là rỗng. */
export const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Dùng với @Transform: chuỗi rỗng sau khi trim thành null (trường không bắt buộc). */
export const trimToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const v = value.trim();
  return v === '' ? null : v;
};
