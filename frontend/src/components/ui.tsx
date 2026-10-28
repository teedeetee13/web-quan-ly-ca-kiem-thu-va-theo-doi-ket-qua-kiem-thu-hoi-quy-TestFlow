import { FormEvent, ReactNode, useEffect } from 'react';
import { ApiError } from '../api';
import { PRIORITY_LABEL } from '../labels';
import type { Priority } from '../types';

export function Modal({
  title,
  onClose,
  onSubmit,
  submitText = 'Lưu',
  busy,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  submitText?: string;
  busy?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        <h2>{title}</h2>
        {children}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? 'Đang lưu…' : submitText}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  if (!error) return null;
  const messages = error instanceof ApiError ? error.messages : [String(error)];
  return (
    <div className="alert error" role="alert">
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <ul>
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PriorityBadge({ value }: { value: Priority }) {
  return <span className={`badge prio-${value.toLowerCase()}`}>{PRIORITY_LABEL[value]}</span>;
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pagination">
      <span className="muted">
        {from}–{to} / {total}
      </span>
      <button className="btn ghost sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹ Trước
      </button>
      <span>
        Trang {page}/{pages}
      </span>
      <button className="btn ghost sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Sau ›
      </button>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}
