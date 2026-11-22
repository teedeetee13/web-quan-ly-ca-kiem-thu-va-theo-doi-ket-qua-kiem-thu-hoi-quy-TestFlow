# Bản chất đề tài TestFlow: học qua tình huống

> Cách đọc: tài liệu này kể **một câu chuyện có thật ở mọi công ty phần mềm**. Mỗi khi câu chuyện gặp một khó khăn, khái niệm cần thiết mới xuất hiện (just-in-time). Bạn sẽ thấy **mỗi chức năng của TestFlow sinh ra để giải quyết đúng một nỗi đau**, chứ không phải được nghĩ ra cho đủ điểm.
>
> Công cụ chưa được giải thích cách dùng. Ở cuối, mỗi công cụ chỉ được trả lời câu hỏi: **"vì sao dự án này cần đến nó"**.

---

## 0. Đề tài trong ba câu

1. Phần mềm nào cũng có lỗi, nên trước khi phát hành phải **kiểm thử**: làm theo các bước định sẵn và so kết quả thật với kết quả mong đợi.
2. Mỗi lần sửa code, cái cũ có thể bị hỏng, nên phải **chạy lại** các bài kiểm thử cũ nhiều lần qua từng phiên bản. Việc này gọi là **kiểm thử hồi quy**.
3. **TestFlow là cuốn sổ chung** để viết các bài kiểm thử đó, chạy lại chúng theo từng đợt, ghi kết quả, và giữ lịch sử đáng tin cậy để quyết định có phát hành hay không.

> TestFlow **không tự kiểm thử** phần mềm khác. Con người làm theo các bước, rồi ghi kết quả vào TestFlow. Đây là chỗ hay hiểu nhầm nhất.

---

## Nhân vật

Một nhóm 3 người đang làm **website bán sách BookStore** (chính là dự án mẫu trong dữ liệu demo của bạn):

- **An**: lập trình viên, viết code BookStore.
- **Minh**: người kiểm thử (tester), kiểm tra BookStore có chạy đúng không.
- **Chị Hà**: trưởng nhóm, quyết định ngày phát hành.

---

## Màn 1. "Em làm xong rồi, chạy được mà"

An làm xong chức năng đăng nhập, thử đăng nhập đúng một lần, thấy vào được, rồi báo xong.

Hôm sau khách hàng gõ sai mật khẩu: trang web **trắng xoá**. Gõ email thiếu `@`: web **vẫn cho đăng nhập**.

**Nỗi đau:** người viết code thường chỉ thử **đường thuận lợi** (happy path). Lỗi nằm ở những đường không ai thử.

**Khái niệm xuất hiện: Kiểm thử phần mềm (testing)**
Là cố ý dùng phần mềm theo **nhiều cách, kể cả cách sai**, để tìm lỗi **trước khi khách hàng tìm thấy**. Kiểm thử không chứng minh phần mềm hết lỗi. Nó chỉ giảm khả năng lỗi lọt ra ngoài.

> **Câu hỏi bản chất: "Sao không để lập trình viên tự kiểm tra?"**
> Người viết code nghĩ theo cách mình đã viết, nên hay bỏ sót đúng chỗ mình đã nghĩ sai. Người kiểm thử nghĩ theo cách **người dùng** sẽ dùng (và dùng sai).

---

## Màn 2. "Hôm trước em thử những gì nhỉ?"

Minh bắt đầu kiểm thử, nhưng **làm theo trí nhớ**. Lần này thử 5 trường hợp, lần sau nhớ được 3. Một bạn mới vào nhóm hỏi "phải thử những gì" thì Minh không trả lời được.

**Nỗi đau:** kiểm thử theo trí nhớ thì **không lặp lại được, không bàn giao được, không biết đã đủ chưa**.

**Khái niệm xuất hiện: Ca kiểm thử (test case)**
Là một **công thức nấu ăn** cho việc kiểm thử. Ai làm theo cũng ra cùng một cách kiểm tra. Ví dụ thật trong dữ liệu demo của bạn:

```
Mã:            TC_LOGIN_02
Tên:           Đăng nhập bằng mật khẩu sai
Độ ưu tiên:    Cao
Tiền điều kiện: Có tài khoản thử nghiệm đang hoạt động
Bước 1: Nhập tên tài khoản hợp lệ    → Mong đợi: Ô email nhận giá trị
Bước 2: Nhập mật khẩu sai            → Mong đợi: Ô mật khẩu hiển thị dạng ẩn
Bước 3: Chọn nút Đăng nhập           → Mong đợi: Không tạo phiên đăng nhập; hiển thị thông báo phù hợp
```

Mỗi trường đều có lý do tồn tại:

| Trường | Vì sao phải có | Thiếu thì sao |
| --- | --- | --- |
| **Mã ca** | Để gọi tên ngắn gọn khi trao đổi: "TC_LOGIN_02 lại lỗi rồi" | Phải đọc cả câu dài, dễ nhầm ca |
| **Tên** | Nói ca này kiểm tra điều gì | Không biết ca để làm gì |
| **Tiền điều kiện** | Những gì phải có **trước khi** bắt đầu | Hai người chạy cùng ca mà khác điều kiện ban đầu, ra kết quả khác nhau |
| **Các bước** | Làm gì, theo thứ tự nào | Mỗi người làm một kiểu |
| **Kết quả mong đợi** của từng bước | **Thước đo đúng/sai** | Không có thước đo thì không thể nói "lỗi" |
| **Độ ưu tiên** | Ca nào quan trọng hơn | Thiếu thời gian thì không biết bỏ ca nào |

> **Câu hỏi bản chất: "Tại sao kết quả mong đợi gắn với từng bước, không phải cả ca?"**
> Để khi hỏng, biết **hỏng ở bước nào**. "Ca đăng nhập lỗi" thì vô dụng. "Bước 3 không hiện thông báo" thì An sửa được ngay.
>
> **Câu hỏi bản chất: "Một ca có thể không có bước nào không?"**
> Không. Ca không có bước thì không có gì để làm theo, cũng không có thước đo. Vì vậy TestFlow bắt buộc ít nhất 1 bước.

---

## Màn 3. "Có 200 ca, ca giỏ hàng nằm đâu?"

BookStore lớn dần: đăng nhập, tìm sách, giỏ hàng, thanh toán. Số ca lên vài trăm. Nhóm nhận thêm một dự án thứ hai: **phần mềm quản lý thư viện**.

**Nỗi đau:** ca để lẫn lộn, khó tìm, hai dự án trộn vào nhau.

**Khái niệm xuất hiện:**
- **Dự án (Project)**: mỗi phần mềm được kiểm thử là một dự án. Dữ liệu các dự án tách biệt.
- **Bộ kiểm thử (Test Suite)**: nhóm các ca theo chức năng ("Đăng nhập", "Giỏ hàng"). Giống chia sách theo kệ.
- **Tìm kiếm và lọc**: gõ "LOGIN" ra các ca đăng nhập, lọc "Nghiêm trọng" ra các ca phải chạy trước.

> **Câu hỏi bản chất: "Mã ca duy nhất trong cái gì?"**
> Duy nhất **trong một dự án**. BookStore và Thư viện đều có thể có `TC_LOGIN_01`, vì đó là hai sản phẩm khác nhau. Trong cùng BookStore thì không được có hai `TC_LOGIN_01`, vì gọi tên sẽ nhầm.
>
> **Câu hỏi bản chất: "Một ca có thể thuộc bộ của dự án khác không?"**
> Không. Ca đăng nhập của BookStore nằm trong bộ "Mượn sách" của Thư viện là dữ liệu vô nghĩa. TestFlow chặn điều này kể cả khi ai đó cố tình sửa yêu cầu gửi lên.
>
> **Câu hỏi bản chất: "Xoá bộ đang chứa ca thì sao?"**
> Không cho xoá, phải chuyển hoặc xoá các ca trước. Lý do: một cú bấm nhầm không được phép làm mất hàng chục ca.

**Đến đây là phần tuần 3 của bạn đã làm.**

---

## Màn 4. "Em chỉ sửa giỏ hàng thôi mà, sao đăng nhập hỏng?"

Phiên bản 1.0 đã kiểm thử kỹ và phát hành. Khách báo lỗi giỏ hàng. An sửa xong, ra **bản 1.1**. Minh chỉ kiểm tra lại giỏ hàng: chạy tốt, phát hành.

Hôm sau: **không ai đăng nhập được**. An đã sửa một hàm dùng chung mà cả giỏ hàng và đăng nhập đều gọi.

**Nỗi đau:** sửa chỗ này, **hỏng chỗ khác đã từng chạy tốt**.

**Khái niệm xuất hiện: Kiểm thử hồi quy (regression testing)**
"Regression" nghĩa là **thụt lùi**: phần mềm lùi lại trạng thái tệ hơn trước. Kiểm thử hồi quy là **chạy lại các ca cũ đã từng đạt** sau mỗi lần thay đổi, để chắc chắn không có gì thụt lùi.

> **Đây là trái tim của đề tài.** Tên đề tài là "...theo dõi kết quả **kiểm thử hồi quy**". Không có hồi quy thì chỉ cần viết ca một lần là xong. Chính vì phải **chạy đi chạy lại qua nhiều phiên bản** mà mới cần một hệ thống quản lý.
>
> **Câu hỏi bản chất: "Sao không chạy lại tất cả mọi lần cho chắc?"**
> Vài trăm ca × vài chục phút = vài ngày. Thực tế người ta **chọn** ca để chạy lại: ca ưu tiên cao, ca liên quan đến chỗ vừa sửa. Đó là lý do có **độ ưu tiên** và **lọc**.

---

## Màn 5. "Bản 1.1 đã chạy những ca nào, kết quả ra sao?"

Bây giờ mỗi phiên bản đều phải chạy lại một loạt ca. Chị Hà hỏi: "Bản 1.1 chạy những ca nào? Bao nhiêu ca đạt? Ca nào chưa chạy?" Minh lục lại tin nhắn Zalo và vài file Excel. Không trả lời được.

**Nỗi đau:** cùng một ca, chạy ở nhiều phiên bản, mỗi lần một kết quả. Cần biết **kết quả nào thuộc lần chạy nào**.

**Khái niệm xuất hiện: Đợt kiểm thử (Test Run)**
Là **một lần chạy lại** cho **một phiên bản cụ thể**: "Hồi quy bản 1.1, ngày 28/10, gồm 25 ca". Mỗi ca trong đợt có **kết quả riêng của đợt đó**.

```
Ca TC_LOGIN_02:   Đợt bản 1.0 → Đạt
                  Đợt bản 1.1 → Không đạt   ← thụt lùi ở đây
                  Đợt bản 1.2 → Đạt         ← đã sửa xong
```

Nhìn theo hàng ngang như trên, bạn thấy được **lịch sử của một ca**. Đó chính là "theo dõi kết quả kiểm thử hồi quy".

**Mỗi kết quả có 4 trạng thái:**

| Trạng thái | Nghĩa | Ví dụ |
| --- | --- | --- |
| **Chưa chạy** | Chưa ai làm | Mặc định khi vừa tạo đợt |
| **Đạt** | Mọi bước đúng như mong đợi | |
| **Không đạt** | Có bước cho kết quả khác mong đợi, tức là **lỗi của phần mềm** | Bấm Đăng nhập, trang trắng |
| **Bị chặn** | **Không thể chạy được** vì lý do khác | Máy chủ thanh toán thử nghiệm đang hỏng nên không chạy được ca thanh toán |

> **Câu hỏi bản chất: "Bị chặn khác Không đạt thế nào? Gộp lại được không?"**
> Không gộp được. "Không đạt" nghĩa là **đã chạy và phần mềm sai**, nên An phải sửa code. "Bị chặn" nghĩa là **chưa chạy được**, nên phải gỡ trở ngại rồi chạy lại. Gộp lại thì An đi sửa một lỗi không tồn tại.
>
> **Câu hỏi bản chất: "Ghi 'Không đạt' là đủ chưa?"**
> Chưa. Phải ghi **kết quả thực tế** ("bấm Đăng nhập thì trang trắng, không có thông báo") và **ghi chú**. Kết quả mong đợi so với kết quả thực tế chính là mô tả lỗi mà An cần để sửa.
>
> **Câu hỏi bản chất: "Vì sao đợt phải ghi phiên bản?"**
> Vì câu hỏi luôn là "**bản nào** có lỗi". Không có phiên bản thì kết quả không biết thuộc về mã nguồn nào.

**Phần này là tuần 5 (WBS 2.6).** Bảng dữ liệu đã có sẵn, chưa có chức năng.

---

## Màn 6. "Sao lịch sử tháng trước lại thay đổi?"

Tháng 1, đợt bản 1.0: TC_LOGIN_02 có **3 bước**, kết quả **Không đạt ở bước 3**.
Tháng 2, Minh sửa TC_LOGIN_02 thành **5 bước** vì giao diện đăng nhập đã đổi.
Tháng 3, chị Hà mở lại đợt bản 1.0 để xem lỗi cũ: thấy **5 bước**, và "Không đạt ở bước 3" giờ chỉ vào **một bước hoàn toàn khác**.

**Nỗi đau:** nếu đợt kiểm thử chỉ **trỏ tới** ca gốc, thì sửa ca gốc là **viết lại lịch sử**. Lịch sử sai thì mọi thống kê cũng sai.

**Khái niệm xuất hiện: Bản chụp (snapshot)**
Lúc tạo đợt, TestFlow **chép nguyên** nội dung từng ca (mã, tên, tiền điều kiện, độ ưu tiên, các bước) vào đợt. Từ đó:
- Sửa ca gốc thì **chỉ ảnh hưởng các đợt tạo sau**.
- Xoá ca gốc thì đợt cũ **vẫn còn bản chụp**, chỉ mất liên kết.

Giống như **ảnh chụp**: người thật thay đổi, ảnh cũ vẫn giữ khuôn mặt ngày hôm đó.

> **Đây là điểm kỹ thuật đáng nói nhất của đề tài.** Kịch bản demo trong kế hoạch của bạn sinh ra để chứng minh điều này: *tạo ca → tạo đợt → ghi Không đạt → sửa ca gốc → mở đợt cũ, vẫn nguyên như lúc chạy*.
>
> **Câu hỏi bản chất: "Chép dữ liệu ra như vậy là trùng lặp, có vi phạm chuẩn hoá CSDL không?"**
> Có trùng lặp, và đó là **cố ý**. Chuẩn hoá dùng để tránh dữ liệu **đang sống** bị mâu thuẫn. Còn bản chụp là **dữ liệu lịch sử**: nó *phải* khác bản hiện tại khi bản hiện tại thay đổi. Hoá đơn bán hàng cũng chép giá tại thời điểm mua, không trỏ tới giá hiện tại.

---

## Màn 7. "Ai vừa sửa kết quả đợt đã chốt?"

Đợt bản 1.1 đã chạy xong và báo cáo lên chị Hà. Hai ngày sau, ai đó đổi một ca từ "Không đạt" thành "Đạt". Số liệu báo cáo không còn khớp.

**Khái niệm xuất hiện: Đóng đợt**
Đợt có 2 trạng thái: **Đang mở** (được ghi kết quả) và **Đã đóng** (khoá, chỉ được xem). Đóng đợt nghĩa là **chốt sổ**. Muốn kiểm tra lại thì **tạo đợt mới**, không sửa đợt cũ.

> **Câu hỏi bản chất: "Vì sao không cho sửa lại đợt đã đóng?"**
> Vì kết quả đợt là **căn cứ ra quyết định phát hành**. Căn cứ mà sửa được sau khi đã quyết định thì không còn là căn cứ.

---

## Màn 8. "Có phát hành bản 1.1 được không?"

Chị Hà không đọc 200 ca. Chị cần **một bức tranh**: bao nhiêu ca đã chạy, đạt bao nhiêu, còn lỗi nghiêm trọng nào không.

**Khái niệm xuất hiện: Thống kê**
- **Tiến độ** = số ca đã chạy / tổng số ca trong đợt.
- **Tỷ lệ đạt** = Đạt / (Đạt + Không đạt).

> **Câu hỏi bản chất: "Vì sao tỷ lệ đạt không chia cho tổng số ca?"**
> Ca **Chưa chạy** và **Bị chặn** chưa cho biết gì về chất lượng phần mềm. Nếu chia cho tổng, đợt mới chạy 2 ca (đều đạt) sẽ ra tỷ lệ đạt 2/100 = 2%, nghe như phần mềm rất tệ. Thực ra chưa đủ dữ liệu để kết luận.
>
> **Câu hỏi bản chất: "Chưa chạy ca nào thì tỷ lệ đạt bằng bao nhiêu?"**
> Không phải 0%. Mẫu số bằng 0 thì hiển thị **"chưa có dữ liệu"**. 0% nghĩa là "chạy rồi và hỏng hết", khác hẳn "chưa chạy".
>
> **Câu hỏi bản chất: "TestFlow có tự quyết định phát hành không?"**
> Không. TestFlow **cung cấp số liệu**, con người (chị Hà) **quyết định**. Có thể phát hành dù còn 1 ca Không đạt mức ưu tiên thấp.

**Khái niệm xuất hiện: Xuất CSV**
CSV là bảng tính dạng văn bản, Excel mở được. Lý do cần: báo cáo gửi cho người **không dùng TestFlow** (khách hàng, giảng viên), hoặc lưu hồ sơ. Lưu ý thực tế: tiếng Việt có dấu phải mở được trong Excel mà không bị lỗi font.

**Phần này là tuần 6 (WBS 2.7).**

---

## Màn 9. "Dùng Excel cũng được mà?"

Đây là câu giảng viên **chắc chắn hỏi**. Trả lời bằng chính các màn trên:

| Nhu cầu | Excel | TestFlow |
| --- | --- | --- |
| Ca có nhiều bước, có thứ tự | Nhồi vào một ô, hoặc mỗi bước một dòng rồi gộp ô | Bước là dữ liệu riêng, sắp xếp được |
| Mã ca không trùng | Không ai chặn | Hệ thống chặn |
| Lịch sử qua nhiều đợt | Mỗi đợt một file hoặc một sheet, phải chép tay | Mỗi đợt tự lưu bản chụp |
| Sửa ca không làm hỏng lịch sử | Sửa sheet gốc là các sheet chép từ nó lệch nhau | Bản chụp giữ nguyên |
| Nhiều người cùng làm | Gửi file qua lại, "bản cuối cùng thật sự" | Một nơi chung |
| Ai được làm gì | Ai có file là sửa được hết | Đăng nhập, phân quyền |
| Thống kê | Tự viết công thức, dễ sai | Tính sẵn, đúng công thức |

> Excel **không sai**, và với 20 ca thì Excel đủ dùng. TestFlow có ích khi **số ca, số đợt, số người** tăng lên. Kế hoạch của bạn có dẫn chứng: công ty Photron chuyển từ nhiều file Excel sang công cụ chuyên dụng vì không theo dõi được lịch sử.
>
> **Câu hỏi bản chất: "Ngoài thị trường có công cụ này chưa? Làm lại để làm gì?"**
> Có: TestRail, Testmo, Zephyr… nhưng thường trả phí và nhiều chức năng. TestFlow là **phiên bản tối giản** cho nhóm 2–5 người. Với đồ án, mục tiêu là **hiểu và xây được** một nghiệp vụ có lịch sử dữ liệu và quy tắc trạng thái rõ ràng, không phải cạnh tranh với TestRail.

---

## Màn 10. "Ai cũng vào xoá được à?"

TestFlow giờ là nơi chung. Thực tập sinh lỡ tay khoá tài khoản của Minh. Một người đã nghỉ việc vẫn đăng nhập được.

**Khái niệm xuất hiện:**
- **Xác thực (authentication)**: **bạn là ai?** Chứng minh bằng email và mật khẩu.
- **Phân quyền (authorization)**: **bạn được làm gì?**
- **Khoá tài khoản** thay vì xoá: người nghỉ việc không đăng nhập được nữa, nhưng tên họ vẫn còn trên các ca và kết quả họ từng ghi.

TestFlow có đúng **2 vai trò**:

| Vai trò | Được làm | Vì sao tách |
| --- | --- | --- |
| **Tester** | Mọi việc với dữ liệu kiểm thử: dự án, bộ, ca, đợt, kết quả | Đây là công việc hằng ngày |
| **Admin** | Thêm việc **quản trị**: tạo và khoá tài khoản, lưu trữ dự án | Đây là những việc ảnh hưởng tới **người khác** hoặc **cả dự án** |

> **Câu hỏi bản chất: "Sao chỉ 2 vai trò? Thực tế có Trưởng nhóm, Developer, Khách…"**
> Nhóm mục tiêu là 2–5 người, ai cũng vừa viết ca vừa chạy ca. Thêm vai trò thì thêm luật mà không giải quyết nỗi đau nào ở quy mô này. Đây là **giới hạn phạm vi có chủ đích**, nói được lý do.
>
> **Câu hỏi bản chất: "Admin có tự khoá mình được không?"**
> Không. Nếu Admin duy nhất tự khoá mình thì không còn ai quản trị hệ thống.
>
> **Câu hỏi bản chất: "Khoá tài khoản thì có hiệu lực khi nào?"**
> **Ngay lập tức**, kể cả khi người đó đang đăng nhập dở. Chờ đến khi họ tự đăng xuất là quá muộn.

---

## Màn 11. "Dự án Thư viện đã xong, xoá đi cho gọn"

**Nỗi đau:** xoá dự án là mất **toàn bộ lịch sử kiểm thử**. Năm sau khách quay lại hỏi "bản 2.0 hồi đó đã kiểm thử những gì", không còn gì để trả lời.

**Khái niệm xuất hiện: Lưu trữ (archive)**
Dự án được **cất đi**: ẩn khỏi danh sách mặc định, **chỉ xem, không sửa**, nhưng không mất gì. Mở lưu trữ thì dùng tiếp được. Chỉ Admin được lưu trữ, vì việc này ảnh hưởng cả nhóm.

> **Nguyên tắc chung rút ra từ Màn 6, 7, 10, 11:** với phần mềm có **lịch sử**, hãy ưu tiên **khoá, đóng, lưu trữ, chụp lại** thay vì **sửa đè, xoá**. Đây là tư duy xuyên suốt đề tài.

---

## Màn 12. Những gì TestFlow **không** làm

Biết ranh giới cũng quan trọng như biết chức năng:

| Hay bị nhầm là | Thực tế | Lý do |
| --- | --- | --- |
| Tự động chạy kiểm thử | **Không.** Người làm theo bước, TestFlow ghi kết quả | Tự động hoá là bài toán khác, cần viết code kiểm thử cho từng phần mềm |
| Quản lý lỗi (bug tracker) như Jira | **Không.** Chỉ ghi chú lỗi trong kết quả | Ngoài phạm vi, có thể tích hợp sau |
| Quyết định phát hành | **Không.** Chỉ cung cấp số liệu | Quyết định là trách nhiệm của con người |
| Đính kèm ảnh chụp lỗi, nhiều người sửa cùng lúc theo thời gian thực | **Không** (ngoài phạm vi bắt buộc) | Một người làm trong 8 tuần, ưu tiên chức năng lõi |

---

## Màn 13. Từ nhu cầu đến kỹ thuật: vì sao cần từng công cụ

Đến giờ chưa có dòng code nào. Bây giờ mới hỏi: **muốn có những thứ ở các màn trên thì cần những mảnh kỹ thuật nào?** Mỗi mảnh cần một công cụ. Chưa học cách dùng, chỉ cần biết **vì sao nó có mặt**.

| Nhu cầu (từ màn nào) | Mảnh kỹ thuật cần có | Công cụ đã chọn | Vì sao công cụ này liên quan tới dự án |
| --- | --- | --- | --- |
| Nhiều người cùng dùng một nơi chung (M9) | Ứng dụng **web**: mở bằng trình duyệt, không cài đặt | | |
| Người dùng nhìn và thao tác: form ca, danh sách, lọc (M2, M3) | **Giao diện** chạy trong trình duyệt | **React** | Màn hình thay đổi liên tục theo dữ liệu (thêm bước, lọc ca). React tự vẽ lại giao diện khi dữ liệu đổi |
| | Công cụ chạy thử giao diện khi đang phát triển | **Vite** | Sửa code là thấy ngay trên trình duyệt |
| Luật phải được giữ dù ai làm gì (M3, M7, M10, M11) | **Máy chủ** chứa luật nghiệp vụ, đứng giữa người dùng và dữ liệu | **NestJS** (chạy trên Node.js) | Luật như "dự án lưu trữ thì chỉ đọc" phải nằm ở nơi người dùng **không sửa được**. NestJS chia sẵn chỗ cho từng loại việc: nhận yêu cầu, kiểm tra quyền, xử lý luật |
| Giao diện và máy chủ nói chuyện với nhau | **Giao thức** thống nhất | **REST API** qua HTTP, dữ liệu dạng **JSON** | Cách phổ biến nhất để trình duyệt gọi máy chủ |
| Lưu lâu dài, nhiều bảng liên kết: dự án → bộ → ca → bước; đợt → bản chụp → kết quả (M3, M5, M6) | **Cơ sở dữ liệu quan hệ** | **PostgreSQL** | Dữ liệu có quan hệ chặt và luật "không trùng mã", "không trỏ tới thứ không tồn tại". CSDL quan hệ tự giữ các luật này. PostgreSQL còn có kiểu **JSON**, vừa khít để lưu các bước trong bản chụp |
| Code máy chủ đọc và ghi CSDL | Lớp "phiên dịch" giữa code và CSDL | **Prisma** | Mô tả các bảng ở một file duy nhất, sinh ra code đọc và ghi có kiểm tra tên cột. Lưu lịch sử thay đổi cấu trúc CSDL (migration) |
| Chạy được trên máy không cài sẵn CSDL | | **embedded-postgres** | Máy bạn chưa có PostgreSQL hay Docker. Gói này mang theo PostgreSQL thật, chi phí 0 đồng đúng như kế hoạch |
| Biết **ai** đang gọi (M10) | Đăng nhập một lần, các yêu cầu sau mang theo "thẻ ra vào" | **JWT** | Máy chủ web không tự nhớ ai đã đăng nhập. JWT là thẻ có chữ ký, giả mạo là bị phát hiện |
| Mật khẩu không bị lộ dù lộ CSDL (M10) | Băm mật khẩu một chiều | **bcrypt** | Chỉ lưu "dấu vân tay" của mật khẩu, không lưu mật khẩu |
| Dữ liệu gửi lên phải hợp lệ: ca phải có bước, mã đúng dạng (M2) | Kiểm tra dữ liệu ở máy chủ | **class-validator** | Giao diện có thể bị bỏ qua (gọi thẳng API), nên máy chủ phải tự kiểm tra |
| Mọi chỗ dùng đúng tên trường, đúng kiểu | Kiểm tra kiểu khi viết code | **TypeScript** | Có rất nhiều trường (code, title, priority, suiteId…). Gõ sai tên là được báo ngay khi viết, không đợi đến lúc demo |
| Chứng minh TestFlow chạy đúng | Kiểm thử tự động | **Jest + Supertest** (đã có), **Playwright** (tuần 6–7) | Xem Màn 14 |
| Người khác đọc được API | Tài liệu API | **Swagger** | Tự sinh danh sách API từ code, thử gọi ngay trên trình duyệt |

> **Câu hỏi bản chất: "Có bắt buộc phải là những công cụ này không?"**
> Không. Mỗi **mảnh** ở cột 2 là bắt buộc. **Công cụ** ở cột 3 thì có thể thay: Vue thay React, Spring Boot thay NestJS, MySQL thay PostgreSQL. Khi bảo vệ, hãy nói theo thứ tự **nhu cầu → mảnh → công cụ**, đừng bắt đầu bằng tên công cụ.
>
> **Câu hỏi bản chất: "Vì sao chọn cùng một ngôn ngữ (TypeScript) cho cả giao diện và máy chủ?"**
> Một người làm, học một ngôn ngữ cho cả hai đầu. Các kiểu dữ liệu (ca, bước, độ ưu tiên) được hiểu giống nhau ở cả hai phía.

---

## Màn 14. Phần mềm kiểm thử thì ai kiểm thử?

TestFlow là phần mềm quản lý kiểm thử, nên chính nó **cũng phải được kiểm thử**. Đây là chỗ đề tài "tự soi gương":

- 26 tình huống TS-01..TS-26 trong `backend/test/week3.e2e-spec.ts` **chính là các ca kiểm thử** cho TestFlow. Mỗi tình huống có điều kiện, thao tác, kết quả mong đợi, giống hệt cấu trúc ca bạn thấy ở Màn 2.
- Khác biệt: TestFlow dành cho **kiểm thử thủ công**, còn 26 tình huống này là **kiểm thử tự động**: máy làm theo bước và so kết quả. Chạy `npm run test:e2e` chính là một **đợt kiểm thử hồi quy** cho TestFlow. Mỗi lần bạn sửa code, chạy lại để chắc không có gì thụt lùi (Màn 4).
- Bạn có thể **nhập chính TS-01..TS-26 vào TestFlow** thành một dự án "TestFlow tự kiểm thử". Đây là một ý demo rất thuyết phục.

> **Câu hỏi bản chất: "Đã có kiểm thử tự động, sao TestFlow lại phục vụ kiểm thử thủ công?"**
> Tự động hoá cần viết code kiểm thử, tốn công, và chỉ đáng khi chức năng ổn định, chạy rất nhiều lần. Nhiều thứ vẫn cần mắt người: giao diện có dễ nhìn không, luồng có hợp lý không. Nhóm nhỏ thường bắt đầu bằng kiểm thử thủ công có quy trình, và đó là đúng đối tượng của TestFlow.

---

## Phần cuối A. Luồng tư duy chuẩn khi làm một dự án thật

Câu chuyện trên đi theo đúng thứ tự mà người làm phần mềm chuyên nghiệp suy nghĩ. Thứ tự này áp dụng được cho **mọi** đề tài:

| # | Câu hỏi phải trả lời | Trong TestFlow | Sản phẩm trong đồ án của bạn |
| --- | --- | --- | --- |
| 1 | **Ai** đang đau, **đau ở đâu**? | Nhóm nhỏ kiểm thử bằng Excel, mất lịch sử, sót ca (Màn 1–9) | Lý do thực hiện, tính thực tế (README mục I) |
| 2 | Giải quyết **đến đâu**, **không** làm gì? | 6 nhóm chức năng, không tự động hoá, không Jira (Màn 12) | Phạm vi, SMART |
| 3 | Người dùng **làm những việc gì**? | Viết ca, tạo đợt, ghi kết quả, xem thống kê | Use Case |
| 4 | Cần **lưu những gì**, quan hệ ra sao? | 8 thực thể, bản chụp (Màn 6) | ERD, `schema.prisma` |
| 5 | **Luật** nào phải luôn đúng? | Mã không trùng, đợt đóng thì khoá, lưu trữ thì chỉ đọc… | Đặc tả, quy tắc nghiệp vụ |
| 6 | Hệ thống **chia thành mấy phần**, nói chuyện thế nào? | Trình duyệt → API → CSDL | Kiến trúc, Sequence |
| 7 | Mỗi phần **dùng công cụ gì**, vì sao? | Màn 13 | Bảng công nghệ |
| 8 | Xây **theo thứ tự nào**? | Nền (đăng nhập) → cha (dự án) → con (ca) → nghiệp vụ lõi (đợt) → tổng hợp (thống kê) | WBS tuần 3 → 6 |
| 9 | **Chứng minh** làm đúng thế nào? | Ca kiểm thử TS-xx, demo kịch bản bản chụp | Kết quả kiểm thử, demo |

Thứ tự 8 có lý do: **cái sau dựng trên cái trước**. Không có đăng nhập thì không biết ai tạo ca. Không có ca thì không có gì để đưa vào đợt. Không có kết quả thì không có gì để thống kê. Đó là lý do tuần 3 làm đăng nhập và ca, tuần 5 mới làm đợt, tuần 6 mới làm thống kê.

---

## Phần cuối B. Danh sách câu hỏi bản chất (tự kiểm tra)

Che cột phải lại, tự trả lời bằng lời của mình, rồi mới mở ra so.

| # | Câu hỏi | Ý chính | Màn |
| --- | --- | --- | --- |
| 1 | Đề tài giải quyết vấn đề gì, cho ai? | Nhóm nhỏ quản lý ca và kết quả kiểm thử hồi quy rời rạc trong Excel | 0, 9 |
| 2 | Kiểm thử phần mềm là gì? | Cố ý dùng phần mềm nhiều cách, kể cả cách sai, để tìm lỗi trước khách hàng | 1 |
| 3 | Ca kiểm thử là gì, gồm những gì, vì sao? | Công thức kiểm thử lặp lại được: mã, tên, tiền điều kiện, bước, kết quả mong đợi, ưu tiên | 2 |
| 4 | Vì sao kết quả mong đợi gắn theo từng bước? | Biết hỏng ở bước nào | 2 |
| 5 | Dự án, bộ kiểm thử để làm gì? | Tách sản phẩm, nhóm ca theo chức năng | 3 |
| 6 | Mã ca duy nhất trong phạm vi nào, vì sao? | Trong một dự án | 3 |
| 7 | Hồi quy là gì, vì sao là trái tim đề tài? | Chạy lại ca cũ sau thay đổi để phát hiện thụt lùi. Chạy nhiều lần mới cần hệ thống | 4 |
| 8 | Vì sao cần độ ưu tiên? | Không đủ thời gian chạy hết, phải chọn | 4 |
| 9 | Đợt kiểm thử là gì, vì sao gắn phiên bản? | Một lần chạy lại cho một phiên bản | 5 |
| 10 | 4 trạng thái, Bị chặn khác Không đạt thế nào? | Lỗi phần mềm khác với chưa chạy được | 5 |
| 11 | Vì sao phải ghi kết quả thực tế? | Mong đợi so với thực tế chính là mô tả lỗi | 5 |
| 12 | Bản chụp là gì, vì sao cần, có vi phạm chuẩn hoá không? | Giữ lịch sử khi ca gốc đổi; trùng lặp có chủ đích | 6 |
| 13 | Vì sao đóng đợt thì khoá? | Kết quả là căn cứ ra quyết định | 7 |
| 14 | Tỷ lệ đạt tính thế nào, vì sao không chia tổng? | Đạt / (Đạt + Không đạt); mẫu bằng 0 thì "chưa có dữ liệu" | 8 |
| 15 | TestFlow có quyết định phát hành không? | Không, chỉ cung cấp số liệu | 8 |
| 16 | Vì sao không dùng Excel? | Lịch sử, ràng buộc, nhiều người, phân quyền, thống kê | 9 |
| 17 | Khác gì TestRail? Làm lại để làm gì? | Tối giản cho nhóm nhỏ; mục tiêu học tập | 9 |
| 18 | Xác thực khác phân quyền thế nào? | Bạn là ai, khác với bạn được làm gì | 10 |
| 19 | Vì sao chỉ 2 vai trò? | Đủ cho quy mô 2–5 người, giới hạn có chủ đích | 10 |
| 20 | Vì sao khoá tài khoản thay vì xoá, và khoá có hiệu lực khi nào? | Giữ dấu vết; hiệu lực ngay | 10 |
| 21 | Vì sao lưu trữ thay vì xoá dự án? | Giữ lịch sử kiểm thử | 11 |
| 22 | TestFlow không làm gì? | Không tự chạy kiểm thử, không quản lý lỗi, không quyết định phát hành | 12 |
| 23 | Vì sao cần máy chủ, không làm mỗi giao diện? | Luật phải nằm nơi người dùng không sửa được | 13 |
| 24 | Vì sao CSDL quan hệ? | Dữ liệu liên kết chặt, cần ràng buộc | 13 |
| 25 | Công cụ có bắt buộc không? | Mảnh kỹ thuật bắt buộc, công cụ thay được | 13 |
| 26 | Ai kiểm thử TestFlow? | Chính nó có ca kiểm thử TS-xx, chạy tự động như một đợt hồi quy | 14 |
| 27 | Vì sao làm theo thứ tự tuần 3 → 5 → 6? | Cái sau dựng trên cái trước | A |

Bước tiếp theo, sau khi đã trả lời được bảng này: đọc [HIEU_DU_AN.md](HIEU_DU_AN.md) để biết **mỗi ý trên nằm ở dòng code nào**.
