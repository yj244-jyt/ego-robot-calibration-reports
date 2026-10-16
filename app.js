const state = { reports: [] };
const deviceFilter = document.querySelector("#device-filter");
const modeFilter = document.querySelector("#mode-filter");
const searchInput = document.querySelector("#report-search");
const reportList = document.querySelector("#report-list");
const template = document.querySelector("#report-template");

const number = (value, digits = 1) =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : "-";

const date = (value) => {
  if (!value) return "日期未记录";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(value));
};

const statusText = (report) => {
  if (report.mode === "smoke" || report.status === "smoke") return "试运行报告";
  if (report.status === "pass") return "通过";
  if (report.status === "fail") return "未通过";
  return "待验收";
};

function renderSummary() {
  const devices = new Set(state.reports.map((report) => report.device_id));
  document.querySelector("#device-count").textContent = devices.size;
  document.querySelector("#report-count").textContent = state.reports.length;
  document.querySelector("#formal-count").textContent = state.reports.filter((report) => report.mode === "formal").length;
  document.querySelector("#smoke-count").textContent = state.reports.filter((report) => report.mode === "smoke").length;
}

function visibleReports() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  return state.reports.filter((report) => {
    if (deviceFilter.value && report.device_id !== deviceFilter.value) return false;
    if (modeFilter.value && report.mode !== modeFilter.value) return false;
    if (!query) return true;
    const haystack = [
      report.device_id, report.device_name, report.robot_name, report.robot_id,
      report.task_id, report.run_id, report.tool_name,
    ].filter(Boolean).join(" ").toLocaleLowerCase();
    return haystack.includes(query);
  });
}

function renderReports() {
  const reports = visibleReports();
  reportList.replaceChildren();
  for (const report of reports) {
    const row = template.content.firstElementChild.cloneNode(true);
    const badge = row.querySelector(".status-badge");
    badge.classList.add(report.mode === "smoke" ? "smoke" : report.status || "pending");
    badge.title = statusText(report);
    row.querySelector("h3").textContent = report.device_name || report.device_id;
    row.querySelector(".device-id").textContent = `${report.device_id} · ${statusText(report)}`;
    row.querySelector(".context").textContent = [
      report.robot_name, report.robot_id, report.arm ? `${report.arm} 臂` : null,
    ].filter(Boolean).join(" · ");
    row.querySelector(".position").textContent = `${number(report.position_p95_mm)} mm`;
    row.querySelector(".orientation").textContent = `${number(report.orientation_p95_deg, 2)}°`;
    row.querySelector(".poses").textContent = report.pose_count ?? "-";
    row.querySelector(".date").textContent = date(report.completed_utc);
    row.querySelector(".open-report").href = report.report;
    reportList.append(row);
  }
  document.querySelector("#visible-count").textContent = `${reports.length} 条`;
  document.querySelector("#empty-state").hidden = reports.length !== 0;
}

async function load() {
  try {
    const response = await fetch("data/reports.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const registry = await response.json();
    state.reports = Array.isArray(registry.reports) ? registry.reports : [];
    const devices = [...new Map(state.reports.map((report) => [
      report.device_id, report.device_name || report.device_id,
    ])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
    for (const [id, name] of devices) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${name} (${id})`;
      deviceFilter.append(option);
    }
    document.querySelector("#updated-at").textContent = registry.generated_utc
      ? `更新于 ${date(registry.generated_utc)}` : "暂无报告";
    renderSummary();
    renderReports();
  } catch (error) {
    document.querySelector("#updated-at").textContent = "数据加载失败";
    document.querySelector("#empty-state").hidden = false;
    document.querySelector("#empty-state").textContent = `无法读取报告清单：${error.message}`;
  }
}

for (const control of [deviceFilter, modeFilter, searchInput]) {
  control.addEventListener("input", renderReports);
}

load();
