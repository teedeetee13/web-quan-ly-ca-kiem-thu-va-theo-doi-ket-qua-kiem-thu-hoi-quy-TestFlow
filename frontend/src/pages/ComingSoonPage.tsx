export default function ComingSoonPage({ title, week }: { title: string; week: string }) {
  return (
    <div className="empty-state">
      <h1>{title}</h1>
      <p className="muted">
        Chức năng này nằm trong kế hoạch {week} (WBS). CSDL đã có sẵn bảng TestRun, RunCase và
        TestResult; API và giao diện sẽ được cài đặt theo đúng tiến độ.
      </p>
    </div>
  );
}
