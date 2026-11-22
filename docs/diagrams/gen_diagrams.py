"""Sinh các sơ đồ SVG cho Chương 2: phân cấp chức năng (BFD) và Use Case theo ký hiệu UML.

Chạy lại sau khi sửa nội dung:  python docs/diagrams/gen_diagrams.py
Ảnh SVG chèn thẳng vào Word (Insert > Pictures) và hiển thị trên GitHub.
"""
import math
from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).parent
FONT = "Segoe UI, Arial, sans-serif"
INK = "#1f2937"


def wrap(text, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if cur and len(cur) + 1 + len(w) > width:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    return lines + [cur]


def text_block(x, y, text, width_chars, size=13, weight="normal", fill=INK):
    lines = wrap(text, width_chars)
    lh = size * 1.25
    y0 = y - (len(lines) - 1) * lh / 2
    return "".join(
        f'<text x="{x}" y="{y0 + i * lh:.1f}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
        f'text-anchor="middle" dominant-baseline="middle">{escape(l)}</text>'
        for i, l in enumerate(lines)
    )


def svg(w, h, body):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
        f'font-family="{FONT}">'
        '<defs>'
        f'<marker id="open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">'
        f'<path d="M0,0 L10,5 L0,10" fill="none" stroke="{INK}" stroke-width="1.3"/></marker>'
        f'<marker id="tri" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="14" markerHeight="14" orient="auto-start-reverse">'
        f'<path d="M0,0 L12,6 L0,12 Z" fill="#fff" stroke="{INK}" stroke-width="1.2"/></marker>'
        '</defs>'
        f'<rect width="{w}" height="{h}" fill="#fff"/>{body}</svg>'
    )


# ---------------------------------------------------------------- BFD

def bfd(title, groups, path):
    """groups: [(tên nhóm, [(tên chức năng, đã_cài_đặt)])]"""
    gw, gh, gap = 178, 52, 14
    lw, lh, lgap, indent = 150, 40, 10, 22
    width = len(groups) * gw + (len(groups) - 1) * gap + 40
    top_y, grp_y = 24, 120
    rows = max(len(items) for _, items in groups)
    height = grp_y + gh + 24 + rows * (lh + lgap) + 70
    b = []
    rw, rh = 440, 50
    rx = (width - rw) / 2
    b.append(f'<rect x="{rx}" y="{top_y}" width="{rw}" height="{rh}" rx="6" fill="#1e3a8a"/>')
    b.append(text_block(width / 2, top_y + rh / 2, title, 40, 15, "bold", "#fff"))
    bus_y = (top_y + rh + grp_y) / 2
    first_cx = 20 + gw / 2
    last_cx = 20 + (len(groups) - 1) * (gw + gap) + gw / 2
    b.append(f'<line x1="{width / 2}" y1="{top_y + rh}" x2="{width / 2}" y2="{bus_y}" stroke="{INK}" stroke-width="1.4"/>')
    b.append(f'<line x1="{first_cx}" y1="{bus_y}" x2="{last_cx}" y2="{bus_y}" stroke="{INK}" stroke-width="1.4"/>')
    for gi, (name, items) in enumerate(groups):
        gx = 20 + gi * (gw + gap)
        cx = gx + gw / 2
        b.append(f'<line x1="{cx}" y1="{bus_y}" x2="{cx}" y2="{grp_y}" stroke="{INK}" stroke-width="1.4"/>')
        b.append(f'<rect x="{gx}" y="{grp_y}" width="{gw}" height="{gh}" rx="5" fill="#dbeafe" stroke="#1e40af" stroke-width="1.4"/>')
        b.append(text_block(cx, grp_y + gh / 2, f"{gi + 1}. {name}", 22, 13, "bold", "#1e3a8a"))
        spine_x = gx + 10
        ly = grp_y + gh + 20
        last_mid = ly
        for li, (item, done) in enumerate(items):
            lx = gx + indent
            mid = ly + lh / 2
            dash = "" if done else ' stroke-dasharray="5 3"'
            b.append(f'<rect x="{lx}" y="{ly}" width="{lw}" height="{lh}" rx="4" fill="#fff" stroke="{INK}" stroke-width="1.1"{dash}/>')
            b.append(text_block(lx + lw / 2, mid, f"{gi + 1}.{li + 1} {item}", 22, 12))
            b.append(f'<line x1="{spine_x}" y1="{mid}" x2="{lx}" y2="{mid}" stroke="{INK}" stroke-width="1.1"/>')
            last_mid = mid
            ly += lh + lgap
        b.append(f'<line x1="{spine_x}" y1="{grp_y + gh}" x2="{spine_x}" y2="{last_mid}" stroke="{INK}" stroke-width="1.1"/>')
    ly = height - 34
    if all(done for _, items in groups for _, done in items):
        (OUT / path).write_text(svg(width, height - 40, "".join(b)), encoding="utf-8")
        return
    b.append(f'<rect x="20" y="{ly}" width="34" height="18" rx="3" fill="#fff" stroke="{INK}"/>')
    b.append(f'<text x="62" y="{ly + 13}" font-size="12" fill="{INK}">Đã cài đặt (tuần 3)</text>')
    b.append(f'<rect x="200" y="{ly}" width="34" height="18" rx="3" fill="#fff" stroke="{INK}" stroke-dasharray="5 3"/>')
    b.append(f'<text x="242" y="{ly + 13}" font-size="12" fill="{INK}">Đã thiết kế, cài đặt tuần 5–6</text>')
    (OUT / path).write_text(svg(width, height, "".join(b)), encoding="utf-8")


# ---------------------------------------------------------------- Use Case

RX, RY = 118, 27


def actor(x, y, name):
    s = f'stroke="{INK}" stroke-width="1.6" fill="none"'
    return (
        f'<circle cx="{x}" cy="{y - 30}" r="11" {s}/>'
        f'<line x1="{x}" y1="{y - 19}" x2="{x}" y2="{y + 12}" {s}/>'
        f'<line x1="{x - 18}" y1="{y - 8}" x2="{x + 18}" y2="{y - 8}" {s}/>'
        f'<line x1="{x}" y1="{y + 12}" x2="{x - 14}" y2="{y + 34}" {s}/>'
        f'<line x1="{x}" y1="{y + 12}" x2="{x + 14}" y2="{y + 34}" {s}/>'
        + text_block(x, y + 50, name, 20, 13, "bold")
    )


def ellipse_edge(cx, cy, tx, ty):
    """Điểm trên viền elip (cx,cy) theo hướng tới (tx,ty)."""
    dx, dy = tx - cx, ty - cy
    if dx == dy == 0:
        return cx, cy
    t = 1 / math.sqrt((dx / RX) ** 2 + (dy / RY) ** 2)
    return cx + dx * t, cy + dy * t


def use_case_diagram(path, title, actors, ucs, assoc, rels=(), gens=(), width=None, height=None):
    """actors: {id: (tên, x, y)}; ucs: {id: (nhãn, x, y)}; assoc: [(actor, uc)];
    rels: [(từ uc, tới uc, 'include'|'extend', dịch_nhãn_x, dịch_nhãn_y)]; gens: [(actor con, actor cha)]."""
    xs = [x for _, x, _ in ucs.values()]
    ys = [y for _, _, y in ucs.values()]
    bx, by = min(xs) - RX - 30, min(ys) - RY - 50
    bw, bh = max(xs) - min(xs) + 2 * RX + 60, max(ys) - min(ys) + 2 * RY + 80
    width = width or bx + bw + 40
    height = height or max(by + bh, max(y for _, _, y in actors.values()) + 80) + 20
    b = [f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" fill="#f8fafc" stroke="{INK}" stroke-width="1.4"/>',
         f'<text x="{bx + bw / 2}" y="{by + 24}" font-size="14" font-weight="bold" fill="{INK}" text-anchor="middle">{escape(title)}</text>']
    for a, u in assoc:
        _, ax, ay = actors[a]
        _, ux, uy = ucs[u]
        sx = ax + (22 if ux > ax else -22)
        # Nối vào đỉnh trái/phải của elip để đường không cắt qua các elip khác.
        ex, ey = (ux - RX if ux > ax else ux + RX), uy
        b.append(f'<line x1="{sx}" y1="{ay - 8}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{INK}" stroke-width="1.1"/>')
    for child, parent in gens:
        _, cx, cy = actors[child]
        _, px, py = actors[parent]
        b.append(f'<line x1="{cx}" y1="{cy - 44}" x2="{px}" y2="{py + 66}" stroke="{INK}" stroke-width="1.3" marker-end="url(#tri)"/>')
    for u, (label, x, y) in ucs.items():
        b.append(f'<ellipse cx="{x}" cy="{y}" rx="{RX}" ry="{RY}" fill="#fff" stroke="{INK}" stroke-width="1.3"/>')
        b.append(text_block(x, y, label, 26, 12.5))
    for f, t, kind, ox, oy in rels:
        _, fx, fy = ucs[f]
        _, tx, ty = ucs[t]
        sx, sy = ellipse_edge(fx, fy, tx, ty)
        ex, ey = ellipse_edge(tx, ty, fx, fy)
        b.append(f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{INK}" stroke-width="1.1" '
                 f'stroke-dasharray="6 4" marker-end="url(#open)"/>')
        mx, my = (sx + ex) / 2 + ox, (sy + ey) / 2 + oy
        b.append(f'<text x="{mx:.1f}" y="{my:.1f}" font-size="12" fill="{INK}" text-anchor="middle" '
                 f'paint-order="stroke" stroke="#fff" stroke-width="4">«{kind}»</text>')
    for name, x, y in actors.values():
        b.append(actor(x, y, name))
    dy = max(0, 20 - by)  # đẩy xuống nếu khung hệ thống tràn mép trên
    body = f'<g transform="translate(0,{dy})">{"".join(b)}</g>'
    (OUT / path).write_text(svg(width, height + dy, body), encoding="utf-8")


def column(ids_labels, x, y0, step=68):
    return {u: (label, x, y0 + i * step) for i, (u, label) in enumerate(ids_labels)}


# ---------------------------------------------------------------- Nội dung

bfd("HỆ THỐNG QUẢN LÝ CA KIỂM THỬ TESTFLOW", [
    ("Quản lý tài khoản", [
        ("Đăng nhập", True), ("Đăng xuất", True), ("Đổi mật khẩu", True),
        ("Xem danh sách tài khoản", True), ("Tạo tài khoản", True),
        ("Sửa thông tin, vai trò", True), ("Khoá / mở khoá tài khoản", True)]),
    ("Quản lý dự án và bộ kiểm thử", [
        ("Xem danh sách dự án", True), ("Tạo, sửa dự án", True),
        ("Lưu trữ / mở lưu trữ dự án", True), ("Thêm bộ kiểm thử", True),
        ("Sửa bộ kiểm thử", True), ("Xoá bộ kiểm thử", True)]),
    ("Quản lý ca kiểm thử", [
        ("Xem danh sách ca", True), ("Tìm kiếm ca theo mã, tên", True),
        ("Lọc theo bộ, độ ưu tiên", True), ("Tạo ca kiểm thử", True),
        ("Sửa ca và các bước", True), ("Xoá ca kiểm thử", True)]),
    ("Quản lý đợt kiểm thử", [
        ("Tạo đợt, chọn ca", True), ("Lưu bản chụp ca", True),
        ("Xem danh sách đợt", True), ("Xem chi tiết đợt", True), ("Đóng đợt", True)]),
    ("Ghi nhận kết quả", [
        ("Ghi trạng thái kết quả", True), ("Nhập kết quả thực tế, ghi chú", True),
        ("Xem lịch sử kết quả của ca", True)]),
    ("Thống kê và báo cáo", [
        ("Thống kê theo trạng thái", True), ("Tiến độ và tỷ lệ đạt", True),
        ("So sánh với đợt trước", True), ("Xuất CSV", True)]),
], "bfd.svg")

# Use Case tổng quát: Tester bên trái nối 11 UC; Admin bên dưới, kế thừa Tester, nối thêm 2 UC.
ucs = column([
    ("UC01", "UC01 Đăng nhập / Đăng xuất"), ("UC02", "UC02 Đổi mật khẩu"),
    ("UC04", "UC04 Quản lý dự án"), ("UC06", "UC06 Quản lý bộ kiểm thử"),
    ("UC07", "UC07 Quản lý ca kiểm thử"), ("UC08", "UC08 Tìm kiếm, lọc ca"),
    ("UC09", "UC09 Tạo đợt kiểm thử"), ("UC10", "UC10 Ghi kết quả"),
    ("UC11", "UC11 Đóng đợt"), ("UC12", "UC12 Xem thống kê"), ("UC13", "UC13 Xuất CSV"),
    ("UC03", "UC03 Quản lý tài khoản"), ("UC05", "UC05 Lưu trữ dự án"),
], 600, 90, 70)
ucs["UC03"] = (ucs["UC03"][0], 600, ucs["UC03"][2] + 30)
ucs["UC05"] = (ucs["UC05"][0], 600, ucs["UC05"][2] + 30)
tester_ucs = ["UC01", "UC02", "UC04", "UC06", "UC07", "UC08", "UC09", "UC10", "UC11", "UC12", "UC13"]
use_case_diagram(
    "usecase_tong_quat.svg", "Hệ thống TestFlow",
    {"T": ("Tester", 90, 448), "A": ("Admin", 90, 935)},
    ucs,
    [("T", u) for u in tester_ucs] + [("A", "UC03"), ("A", "UC05")],
    gens=[("A", "T")], width=800,
)

# UC03 – Quản lý tài khoản
use_case_diagram(
    "usecase_tai_khoan.svg", "Quản lý tài khoản",
    {"T": ("Tester", 80, 160), "A": ("Admin", 80, 520)},
    {
        "login": ("Đăng nhập", 380, 80),
        "logout": ("Đăng xuất", 380, 160),
        "pwd": ("Đổi mật khẩu của mình", 380, 240),
        "list": ("Xem danh sách tài khoản", 380, 360),
        "search": ("Tìm kiếm, lọc theo vai trò", 680, 360),
        "create": ("Tạo tài khoản", 380, 440),
        "edit": ("Sửa họ tên, vai trò", 380, 520),
        "reset": ("Đặt lại mật khẩu", 680, 520),
        "lock": ("Khoá / mở khoá tài khoản", 380, 600),
    },
    [("A", "list"), ("A", "create"), ("A", "edit"), ("A", "lock"),
     ("T", "login"), ("T", "logout"), ("T", "pwd")],
    rels=[("search", "list", "extend", 0, -10), ("reset", "edit", "extend", 0, -10)],
    gens=[("A", "T")],
)

# UC04–UC06 – Dự án và bộ kiểm thử
use_case_diagram(
    "usecase_du_an.svg", "Quản lý dự án và bộ kiểm thử",
    {"T": ("Tester", 80, 220), "A": ("Admin", 80, 560)},
    {
        "list": ("Xem danh sách dự án", 380, 80),
        "search": ("Tìm dự án theo tên", 680, 80),
        "create": ("Tạo dự án", 380, 155),
        "edit": ("Sửa dự án", 380, 230),
        "suite_add": ("Thêm bộ kiểm thử", 380, 305),
        "suite_edit": ("Sửa bộ kiểm thử", 380, 380),
        "suite_del": ("Xoá bộ kiểm thử (khi không còn ca)", 380, 455),
        "archive": ("Lưu trữ dự án", 380, 560),
        "unarchive": ("Mở lưu trữ dự án", 380, 635),
    },
    [("T", u) for u in ["list", "create", "edit", "suite_add", "suite_edit", "suite_del"]]
    + [("A", "archive"), ("A", "unarchive")],
    rels=[("search", "list", "extend", 0, -10)],
    gens=[("A", "T")],
)

# UC07–UC08 – Ca kiểm thử
use_case_diagram(
    "usecase_ca_kiem_thu.svg", "Quản lý ca kiểm thử",
    {"T": ("Tester", 80, 260)},
    {
        "list": ("Xem danh sách ca", 380, 80),
        "search": ("Tìm kiếm theo mã, tên", 690, 50),
        "filter": ("Lọc theo bộ, độ ưu tiên", 690, 125),
        "view": ("Xem chi tiết ca", 380, 175),
        "create": ("Tạo ca kiểm thử", 380, 270),
        "edit": ("Sửa ca kiểm thử", 380, 365),
        "steps": ("Quản lý các bước (thêm, xoá, sắp xếp)", 690, 318),
        "delete": ("Xoá ca kiểm thử", 380, 460),
    },
    [("T", u) for u in ["list", "view", "create", "edit", "delete"]],
    rels=[("search", "list", "extend", 0, -8), ("filter", "list", "extend", 0, 16),
          ("create", "steps", "include", -10, -8), ("edit", "steps", "include", -10, 18)],
)

# UC09–UC13 – Đợt, kết quả, thống kê
use_case_diagram(
    "usecase_dot_kiem_thu.svg", "Đợt kiểm thử, kết quả và thống kê",
    {"T": ("Tester", 80, 330)},
    {
        "create": ("Tạo đợt kiểm thử", 380, 80),
        "pick": ("Chọn ca cho đợt", 690, 50),
        "snap": ("Lưu bản chụp ca", 690, 125),
        "list": ("Xem danh sách đợt", 380, 175),
        "run": ("Thực hiện đợt (xem bước từ bản chụp)", 380, 270),
        "record": ("Ghi kết quả", 690, 270),
        "close": ("Đóng đợt", 380, 365),
        "history": ("Xem lịch sử kết quả của ca", 380, 460),
        "stats": ("Xem thống kê đợt", 380, 555),
        "compare": ("So sánh với đợt trước (thụt lùi, đã sửa)", 690, 520),
        "csv": ("Xuất CSV", 690, 595),
    },
    [("T", u) for u in ["create", "list", "run", "close", "history", "stats"]],
    rels=[("create", "pick", "include", -10, -8), ("create", "snap", "include", -10, 18),
          ("record", "run", "extend", 0, -8), ("csv", "stats", "extend", 0, 18), ("stats", "compare", "include", -10, -8)],
)

print("Đã sinh:", ", ".join(sorted(p.name for p in OUT.glob("*.svg"))))
