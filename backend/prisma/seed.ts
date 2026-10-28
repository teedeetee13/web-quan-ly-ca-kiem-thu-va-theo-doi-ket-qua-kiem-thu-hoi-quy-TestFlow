/**
 * Dữ liệu mẫu demo: 2 tài khoản, 2 dự án, 7 bộ kiểm thử, 32 ca kiểm thử.
 * CẢNH BÁO: script xoá toàn bộ dữ liệu cũ rồi tạo lại — chỉ dùng cho môi trường demo.
 * Tài khoản mẫu là dữ liệu giả lập (đề cương mục 2.4).
 */
import { Priority, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type Step = [action: string, expected: string];
type CaseSeed = [code: string, title: string, priority: Priority, pre: string | null, steps: Step[]];

const bookstore: Record<string, CaseSeed[]> = {
  'Đăng nhập': [
    ['TC_LOGIN_01', 'Đăng nhập thành công với tài khoản hợp lệ', 'CRITICAL', 'Có tài khoản đang hoạt động', [
      ['Mở trang đăng nhập', 'Hiển thị form email và mật khẩu'],
      ['Nhập email và mật khẩu đúng, bấm Đăng nhập', 'Chuyển tới trang chủ, hiển thị tên người dùng'],
    ]],
    ['TC_LOGIN_02', 'Đăng nhập bằng mật khẩu sai', 'HIGH', 'Có tài khoản thử nghiệm đang hoạt động', [
      ['Nhập tên tài khoản hợp lệ', 'Ô email nhận giá trị'],
      ['Nhập mật khẩu sai', 'Ô mật khẩu hiển thị dạng ẩn'],
      ['Chọn nút Đăng nhập', 'Không tạo phiên đăng nhập; hiển thị thông báo phù hợp'],
    ]],
    ['TC_LOGIN_03', 'Đăng nhập khi để trống email', 'MEDIUM', null, [
      ['Để trống email, nhập mật khẩu, bấm Đăng nhập', 'Báo lỗi "Email là bắt buộc"'],
    ]],
    ['TC_LOGIN_04', 'Đăng nhập với email sai định dạng', 'MEDIUM', null, [
      ['Nhập "abc@" vào ô email', 'Báo lỗi định dạng email'],
    ]],
    ['TC_LOGIN_05', 'Tài khoản bị khoá không đăng nhập được', 'HIGH', 'Có tài khoản đã bị khoá', [
      ['Nhập đúng email, mật khẩu của tài khoản bị khoá', 'Từ chối đăng nhập, báo tài khoản bị khoá'],
    ]],
    ['TC_LOGIN_06', 'Đăng xuất', 'MEDIUM', 'Đã đăng nhập', [
      ['Bấm Đăng xuất', 'Quay về trang đăng nhập'],
      ['Bấm nút Back của trình duyệt', 'Không vào lại được trang cần đăng nhập'],
    ]],
  ],
  'Tìm kiếm sách': [
    ['TC_SEARCH_01', 'Tìm sách theo tên chính xác', 'HIGH', 'Có sách "Dế Mèn phiêu lưu ký"', [
      ['Nhập "Dế Mèn phiêu lưu ký" vào ô tìm kiếm', 'Gợi ý hiển thị sách tương ứng'],
      ['Nhấn Enter', 'Kết quả chứa đúng cuốn sách'],
    ]],
    ['TC_SEARCH_02', 'Tìm sách không dấu', 'MEDIUM', null, [
      ['Nhập "de men"', 'Vẫn trả về "Dế Mèn phiêu lưu ký"'],
    ]],
    ['TC_SEARCH_03', 'Tìm kiếm không có kết quả', 'LOW', null, [
      ['Nhập "xyz123khongco"', 'Hiển thị "Không tìm thấy sách phù hợp"'],
    ]],
    ['TC_SEARCH_04', 'Lọc sách theo khoảng giá', 'MEDIUM', null, [
      ['Chọn khoảng giá 50.000–100.000đ', 'Chỉ hiển thị sách có giá trong khoảng'],
    ]],
    ['TC_SEARCH_05', 'Sắp xếp theo giá tăng dần', 'LOW', null, [
      ['Chọn sắp xếp "Giá tăng dần"', 'Danh sách sắp xếp đúng thứ tự'],
    ]],
  ],
  'Giỏ hàng': [
    ['TC_CART_01', 'Thêm sách vào giỏ', 'CRITICAL', 'Đã đăng nhập', [
      ['Mở trang chi tiết sách', 'Hiển thị nút "Thêm vào giỏ"'],
      ['Bấm "Thêm vào giỏ"', 'Biểu tượng giỏ tăng 1'],
    ]],
    ['TC_CART_02', 'Cập nhật số lượng trong giỏ', 'HIGH', 'Giỏ có 1 sách', [
      ['Đổi số lượng thành 3', 'Thành tiền = 3 × đơn giá'],
    ]],
    ['TC_CART_03', 'Nhập số lượng âm', 'MEDIUM', 'Giỏ có 1 sách', [
      ['Nhập số lượng -1', 'Từ chối, giữ số lượng cũ'],
    ]],
    ['TC_CART_04', 'Xoá sách khỏi giỏ', 'HIGH', 'Giỏ có 2 sách', [
      ['Bấm Xoá ở sách thứ nhất', 'Giỏ còn 1 sách, tổng tiền cập nhật'],
    ]],
    ['TC_CART_05', 'Giỏ hàng giữ nguyên sau khi tải lại trang', 'MEDIUM', 'Giỏ có 1 sách', [
      ['Nhấn F5', 'Giỏ vẫn còn sách'],
    ]],
    ['TC_CART_06', 'Thêm sách đã hết hàng', 'HIGH', 'Có sách tồn kho = 0', [
      ['Mở sách hết hàng', 'Nút "Thêm vào giỏ" bị vô hiệu, hiển thị "Hết hàng"'],
    ]],
  ],
  'Thanh toán': [
    ['TC_PAY_01', 'Đặt hàng thanh toán khi nhận hàng', 'CRITICAL', 'Giỏ có ít nhất 1 sách', [
      ['Bấm "Thanh toán"', 'Hiển thị form địa chỉ'],
      ['Nhập địa chỉ hợp lệ, chọn COD', 'Nút "Đặt hàng" được bật'],
      ['Bấm "Đặt hàng"', 'Tạo đơn, hiển thị mã đơn, giỏ trống'],
    ]],
    ['TC_PAY_02', 'Đặt hàng thiếu địa chỉ', 'HIGH', 'Giỏ có ít nhất 1 sách', [
      ['Để trống địa chỉ, bấm "Đặt hàng"', 'Báo lỗi địa chỉ là bắt buộc'],
    ]],
    ['TC_PAY_03', 'Áp dụng mã giảm giá hợp lệ', 'MEDIUM', 'Có mã GIAM10 còn hạn', [
      ['Nhập GIAM10, bấm Áp dụng', 'Tổng tiền giảm 10%'],
    ]],
    ['TC_PAY_04', 'Áp dụng mã giảm giá hết hạn', 'MEDIUM', 'Có mã HETHAN đã hết hạn', [
      ['Nhập HETHAN, bấm Áp dụng', 'Báo mã đã hết hạn, tổng tiền không đổi'],
    ]],
    ['TC_PAY_05', 'Xem lịch sử đơn hàng', 'LOW', 'Đã có ít nhất 1 đơn', [
      ['Mở "Đơn hàng của tôi"', 'Hiển thị đơn mới nhất ở đầu danh sách'],
    ]],
  ],
};

const library: Record<string, CaseSeed[]> = {
  'Mượn sách': [
    ['TC_BORROW_01', 'Mượn sách còn trong kho', 'CRITICAL', 'Độc giả có thẻ còn hạn', [
      ['Quét mã thẻ độc giả', 'Hiển thị thông tin độc giả'],
      ['Quét mã sách', 'Sách được thêm vào phiếu mượn'],
      ['Bấm "Xác nhận mượn"', 'Tạo phiếu mượn, số lượng tồn giảm 1'],
    ]],
    ['TC_BORROW_02', 'Mượn khi thẻ đã hết hạn', 'HIGH', 'Độc giả có thẻ hết hạn', [
      ['Quét mã thẻ hết hạn', 'Báo thẻ hết hạn, không cho tạo phiếu'],
    ]],
    ['TC_BORROW_03', 'Mượn vượt quá 5 cuốn', 'HIGH', 'Độc giả đang mượn 5 cuốn', [
      ['Thêm cuốn thứ 6 vào phiếu', 'Báo vượt hạn mức mượn'],
    ]],
    ['TC_BORROW_04', 'Mượn sách đã hết', 'MEDIUM', 'Có sách tồn kho = 0', [
      ['Quét mã sách đã hết', 'Báo sách không còn để mượn'],
    ]],
  ],
  'Trả sách': [
    ['TC_RETURN_01', 'Trả sách đúng hạn', 'CRITICAL', 'Có phiếu mượn chưa quá hạn', [
      ['Quét mã sách cần trả', 'Hiển thị phiếu mượn tương ứng'],
      ['Bấm "Xác nhận trả"', 'Phiếu chuyển "Đã trả", tồn kho tăng 1'],
    ]],
    ['TC_RETURN_02', 'Trả sách quá hạn tính phí', 'HIGH', 'Có phiếu quá hạn 3 ngày', [
      ['Quét mã sách quá hạn', 'Hiển thị phí phạt = 3 × 5.000đ'],
    ]],
    ['TC_RETURN_03', 'Trả sách không có trong phiếu', 'MEDIUM', null, [
      ['Quét mã sách chưa được mượn', 'Báo không tìm thấy phiếu mượn'],
    ]],
    ['TC_RETURN_04', 'Gia hạn mượn sách', 'MEDIUM', 'Phiếu chưa gia hạn lần nào', [
      ['Bấm "Gia hạn" trên phiếu', 'Hạn trả cộng thêm 7 ngày'],
    ]],
  ],
  'Quản lý độc giả': [
    ['TC_READER_01', 'Thêm độc giả mới', 'HIGH', null, [
      ['Nhập họ tên, ngày sinh, số điện thoại', 'Các ô hợp lệ'],
      ['Bấm Lưu', 'Tạo độc giả, sinh mã thẻ tự động'],
    ]],
    ['TC_READER_02', 'Thêm độc giả trùng số điện thoại', 'MEDIUM', 'Đã có độc giả SĐT 0901234567', [
      ['Nhập SĐT 0901234567, bấm Lưu', 'Báo số điện thoại đã tồn tại'],
    ]],
    ['TC_READER_03', 'Tìm độc giả theo tên có dấu', 'LOW', 'Có độc giả "Trần Thị Hoa"', [
      ['Nhập "Hoa" vào ô tìm kiếm', 'Hiển thị "Trần Thị Hoa"'],
    ]],
    ['TC_READER_04', 'Gia hạn thẻ độc giả', 'MEDIUM', 'Có độc giả thẻ sắp hết hạn', [
      ['Bấm "Gia hạn thẻ" 12 tháng', 'Ngày hết hạn tăng 12 tháng'],
    ]],
  ],
};

async function seedProject(
  name: string,
  description: string,
  suites: Record<string, CaseSeed[]>,
  createdById: number,
) {
  const project = await prisma.project.create({ data: { name, description, createdById } });
  for (const [suiteName, cases] of Object.entries(suites)) {
    const suite = await prisma.testSuite.create({ data: { projectId: project.id, name: suiteName } });
    for (const [code, title, priority, preconditions, steps] of cases) {
      await prisma.testCase.create({
        data: {
          projectId: project.id,
          suiteId: suite.id,
          code,
          title,
          priority,
          preconditions,
          createdById,
          steps: { create: steps.map(([action, expected], i) => ({ order: i + 1, action, expected })) },
        },
      });
    }
  }
  return project;
}

async function main() {
  // Xoá sạch và đặt lại bộ đếm ID để dữ liệu demo luôn có ID giống nhau.
  await prisma.$executeRawUnsafe(
    'TRUNCATE "TestResult", "RunCase", "TestRun", "TestStep", "TestCase", "TestSuite", "Project", "User" RESTART IDENTITY CASCADE',
  );

  const admin = await prisma.user.create({
    data: {
      email: 'admin@testflow.local',
      fullName: 'Quản trị viên',
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash('Admin@123', 10),
    },
  });
  await prisma.user.create({
    data: {
      email: 'tester@testflow.local',
      fullName: 'Nguyễn Văn Kiểm',
      role: Role.TESTER,
      passwordHash: await bcrypt.hash('Tester@123', 10),
    },
  });
  await prisma.user.create({
    data: {
      email: 'locked@testflow.local',
      fullName: 'Tài khoản bị khoá',
      role: Role.TESTER,
      isActive: false,
      passwordHash: await bcrypt.hash('Locked@123', 10),
    },
  });

  await seedProject('Website bán sách BookStore', 'Ứng dụng mẫu để thử kiểm thử hồi quy qua các phiên bản.', bookstore, admin.id);
  await seedProject('Phần mềm quản lý thư viện', 'Dự án mẫu thứ hai: mượn/trả sách và độc giả.', library, admin.id);

  const [users, projects, suites, cases, steps] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.testSuite.count(),
    prisma.testCase.count(),
    prisma.testStep.count(),
  ]);
  console.log(`Seed xong: ${users} tài khoản, ${projects} dự án, ${suites} bộ, ${cases} ca, ${steps} bước.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
