# Report Data Audit and Test-PC Verification / 报告数据审计与测试电脑核对清单

> Context / 背景：根据 `ego-robot-calibration-reports` 当前发布的 7 份报告进行交叉审计。本文用于带到测试电脑上核对原始数据、时间同步、过滤规则和最终汇总字段。审计日期：2026-11-02。

## 1. Audit Summary / 审计摘要

- [x] PICO 4 Ultra 第二次测试具备完整的原始与过滤后连续轨迹统计。
- [x] Skyworth E6 第二次测试具备完整的原始与过滤后连续轨迹统计。
- [x] Meta Quest 3 第二次测试具备完整的原始连续轨迹统计，但过滤后统计没有完整列出 P95、RMSE 和样本数。
- [x] Skyworth E6 首次正式测试具备完整的原始连续轨迹统计，但过滤后统计没有完整列出 P95、RMSE 和样本数。
- [ ] Meta Quest 3 静态阶段报告没有连续轨迹统计；报告内部明确记录轨迹样本数为 0。
- [ ] Skyworth E6 试运行报告只提供 6 个测试姿态的汇总，不具备与正式报告相同的连续同步轨迹统计。
- [ ] Skyworth E6 首次正式测试的真实设备编号尚未在原始包中确认；原始适配器仍使用 `E6-CONTROLLER-REPLACE` 占位值。
- [ ] Vive Tracker 报告缺少原始数据文件、测试日期、Tracker 序列号和分析脚本版本，暂时不能在测试电脑上独立复算。

目录页当前统一展示未过滤的连续轨迹统计：轨迹位置 P95、轨迹姿态 P95 和轨迹同步样本数。没有完整轨迹统计的报告显示空值，不再使用静态 P95 代替。

---

## 2. Metric Definitions / 指标定义

| 指标 | 定义 | 不能替代的指标 |
|---|---|---|
| Mean / 均值 | 所有有效同步样本误差的算术平均 | 不能替代 P95 或最大值 |
| Median / 中位数 | 50% 样本不超过该误差 | 不能描述高误差尾部 |
| P95 | 95% 样本不超过该误差 | 不是均值，也不是最大值 |
| Maximum / 最大值 | 本次记录中最大的单样本误差 | 对单点异常最敏感 |
| Raw / 未过滤 | 保留所有被判定为有效的同步样本 | 不等于去异常值结果 |
| Filtered / 过滤后 | 按报告声明的异常规则删除样本后重算 | 必须同时记录过滤规则与保留数 |

Quest 3 第二次测试中，轨迹位置误差的中位数为 4.78 mm、均值为 8.98 mm、P95 为 20.96 mm、最大值为 174.98 mm。这是一组明显右偏的分布，因此出现 `P95 > 均值 > 中位数` 是正常的统计现象，不是计算公式错误。

---

## 3. Cross-Report Trajectory Audit / 跨报告轨迹审计

| 报告 | 轨迹位置 P95 | 轨迹姿态 P95 | 同步样本 | 轨迹位置最大值 | 轨迹姿态最大值 | 目录处理 |
|---|---:|---:|---:|---:|---:|---|
| PICO 4 Ultra 第二次 | 17.03 mm | 1.33 deg | 2920 | 256.18 mm | 3.21 deg | 展示原始轨迹统计 |
| Skyworth E6 第二次 | 15.80 mm | 3.77 deg | 2750 | 92.65 mm | 10.41 deg | 展示原始轨迹统计 |
| Meta Quest 3 第二次 | 20.96 mm | 2.54 deg | 9824 | 174.98 mm | 6.49 deg | 展示原始轨迹统计 |
| Meta Quest 3 静态阶段 | — | — | 0 | — | — | 显示缺失，不用静态值替代 |
| Skyworth E6 首次正式 | 16.80 mm | 3.60 deg | 12554 | 104.09 mm | 11.00 deg | 展示原始轨迹统计 |
| Skyworth E6 试运行 | — | — | 0 | — | — | 显示缺失，不与正式轨迹横向比较 |
| Vive Tracker v5/v6/v7 | 单独口径 | 单独口径 | 2705 个 Vive 源帧 | 单独口径 | 单独口径 | 保留专用标签 |

### A. Filtered Results / 过滤后结果

| 报告 | 过滤后位置 P95 | 过滤后姿态 P95 | 保留样本 | 过滤后位置最大值 | 过滤后姿态最大值 |
|---|---:|---:|---:|---:|---:|
| PICO 4 Ultra 第二次 | 15.33 mm | 1.17 deg | 2854 | 25.46 mm | 2.07 deg |
| Skyworth E6 第二次 | 14.82 mm | 3.59 deg | 2693 | 23.97 mm | 6.32 deg |
| Meta Quest 3 第二次 | — | — | — | 20.89 mm | 4.64 deg |
| Skyworth E6 首次正式 | — | — | — | 18.42 mm | 5.89 deg |

- [ ] 在测试电脑上补导 Meta Quest 3 第二次测试的过滤后 RMSE、中位数、P95 和保留样本数。
- [ ] 在测试电脑上补导 Skyworth E6 首次正式测试的过滤后 RMSE、中位数、P95 和保留样本数。
- [ ] 确认所有报告的过滤规则是否都是平移/旋转联合 `Q3 + 3 * IQR`，不要仅根据页面显示推断。

---

## 4. Per-Report Problems / 各报告问题

### A. PICO 4 Ultra Second Test / PICO 4 Ultra 第二次测试

- [x] 原始轨迹统计完整：2920 个同步样本。
- [x] 过滤后保留 2854 个样本，排除 66 个样本。
- [ ] 复核位置最大值 256.18 mm 对应的 3.1 s 时刻，确认是否为跟踪跳变、时间错配或外参异常。
- [ ] 重点检查 `a01`、`a09`、`a12`、`a15` 和 `a16`，页面记录这些轨迹包含被过滤样本。
- [ ] 确认目录使用未过滤 P95 17.03 mm 是否符合最终对外口径；如需采用过滤后结果，应同时修改标签为“过滤后轨迹 P95”。

### B. Skyworth E6 Second Test / Skyworth E6 第二次测试

- [x] 原始轨迹统计完整：2750 个同步样本。
- [x] 过滤后保留 2693 个样本，排除 57 个样本。
- [ ] 复核标定姿态 `c08`。报告记录该点残差为 196.081 mm / 20.407 deg，并从修订标定拟合中剔除。
- [ ] 复核轨迹位置最大值 92.65 mm 对应的 180.659915208 s 时刻。
- [ ] 确认静态报告中 16 个原始姿态与 15 个修订标定姿态的命名和用途，避免把两者样本数混用。

### C. Meta Quest 3 Second Test / Meta Quest 3 第二次测试

- [x] 原始轨迹统计完整：9824 个同步样本。
- [x] 原始位置统计为均值 8.98 mm、中位数 4.78 mm、P95 20.96 mm、最大值 174.98 mm。
- [ ] 复核最大值发生时刻 199.447674266 s 前后的原始 tracking flags、数据年龄、插值跨度和坐标 epoch。
- [ ] 导出过滤前后被排除样本的轨迹 ID、时间戳、位置误差和姿态误差。
- [ ] 补齐过滤后的 RMSE、中位数、P95、保留样本数和过滤规则。
- [ ] 确认 174.98 mm 异常是否来自少量瞬时跳变；不能仅凭过滤后最大值 20.89 mm 判断原因。

### D. Meta Quest 3 Static Stage / Meta Quest 3 静态阶段

- [x] 静态阶段原始统计存在：13 个姿态，位置 P95 157.29 mm，姿态 P95 24.60 deg。
- [x] 页面内部状态为“未通过”。
- [ ] 连续轨迹统计完全缺失，最终统计表记录轨迹样本数为 0。
- [ ] 仓库虽包含 `robot-raw-trajectory.zip` 和 `vr-raw-trajectory.zip`，但当前报告没有成功生成同步轨迹统计；需要确认是阶段未执行还是分析流程未完成。
- [ ] 复核原始静态最大误差 230.50 mm / 55.27 deg 与过滤后最大值 6.89 mm / 2.60 deg 的巨大差异。
- [ ] 输出被过滤静态姿态的 ID、原始记录、过滤原因和人工复核结论。

### E. Skyworth E6 First Formal Test / Skyworth E6 首次正式测试

- [x] 原始轨迹统计完整：12554 个同步样本。
- [ ] 原始 VR 包中的 `adapter_config.device_id` 为 `E6-CONTROLLER-REPLACE`，且 `mapping_status` 为 `template_not_verified_against_vendor_sample`。
- [ ] 目录使用设备编号 `1150093702826062300073`，但当前报告和原始包没有保存两者之间的映射证据。
- [ ] 报告页面显示测试时间“未记录”；原始采集记录约从 2026-10-16 06:20 UTC 开始，目录完成时间为 2026-10-16 07:01 UTC。需要区分采集开始、采集结束和报告完成时间。
- [ ] 复核轨迹 `a09` 的位置最大值 104.09 mm 和姿态最大值 11.00 deg。
- [ ] 补齐过滤后的 RMSE、中位数、P95、保留样本数和排除样本列表。

### F. Skyworth E6 Smoke Test / Skyworth E6 试运行

- [x] 6 个测试姿态的 P95 统计存在：位置 69.940 mm，姿态 3.339 deg。
- [ ] 该报告是流程试运行，不代表正式计量验收。
- [ ] 当前没有与正式报告同口径的连续同步样本聚合统计。
- [ ] 如需进入目录横向对比，应重新导出逐同步样本的轨迹 RMSE、中位数、P95、最大值和样本数；否则保持空值。

### G. Vive Tracker v5/v6/v7 / Vive Tracker 三组跟随测试

- [x] 当前页面包含三组汇总统计和时延补偿结果。
- [ ] 仓库未包含 v5、v6、v7 的原始 Robot/Vive 文件和分析脚本，无法独立复算。
- [ ] 补充测试日期、Vive Tracker 序列号、OpenXR/SteamVR 版本、机械臂编号和脚本提交版本。
- [ ] 保留 Robot 主机时钟、Vive 主机时钟、时钟交换记录和全部原始时间戳。
- [ ] 确认 OpenXR 时间戳是否使用预测显示时间，不能把软件流相对偏移解释为硬件绝对延迟。

---

## 5. Required Export Schema / 必需导出结构

每次测试应输出一个机器可读的汇总文件。缺失值使用 `null`，不要用静态值替代轨迹值。

```json
{
  "run_id": "",
  "device_id": "",
  "device_serial_source": "vendor|adapter|manual|unknown",
  "robot_id": "",
  "capture_started_utc": null,
  "capture_completed_utc": null,
  "report_generated_utc": null,
  "timestamp_model": "",
  "trajectory_raw": {
    "position_mm": {
      "mean": null,
      "rmse": null,
      "median": null,
      "p95": null,
      "max": null
    },
    "orientation_deg": {
      "mean": null,
      "rmse": null,
      "median": null,
      "p95": null,
      "max": null
    },
    "sample_count": 0,
    "segment_count": 0
  },
  "trajectory_filtered": {
    "filter_rule": null,
    "position_mm": {
      "mean": null,
      "rmse": null,
      "median": null,
      "p95": null,
      "max": null
    },
    "orientation_deg": {
      "mean": null,
      "rmse": null,
      "median": null,
      "p95": null,
      "max": null
    },
    "sample_count": 0,
    "excluded_count": 0,
    "excluded_samples": []
  },
  "static_raw": {
    "position_p95_mm": null,
    "orientation_p95_deg": null,
    "sample_count": 0
  },
  "acceptance": {
    "status": "pending|pass|fail|smoke",
    "profile": "",
    "reason": ""
  }
}
```

---

## 6. Test-PC Verification Procedure / 测试电脑核对步骤

- [ ] 找到每个 `run_id` 对应的原始运行目录，不要从网页压缩后的可视化数组反推唯一真值。
- [ ] 记录分析脚本 Git SHA、Python 环境、依赖版本和命令行参数。
- [ ] 校验 Robot 与 VR 原始文件的 SHA-256，并与报告附录记录比较。
- [ ] 校验设备编号来源；禁止继续使用 `REPLACE`、`UNKNOWN` 或模板默认值发布正式报告。
- [ ] 分别记录采集开始、采集结束和报告生成时间。
- [ ] 检查 Robot 与 VR 的 timestamp domain、timestamp model、host offset 和 source timestamp。
- [ ] 逐段重建同步样本，记录插值跨度、数据年龄、tracking flags 和 coordinate epoch。
- [ ] 对未过滤样本计算 mean、RMSE、median、P95、maximum 和 sample count。
- [ ] 按明确保存的过滤规则重算过滤后统计，并导出每个排除样本的原因。
- [ ] 检查统计是否按“全部同步样本”聚合，而不是先对每段取均值再二次平均。
- [ ] 检查角度误差是否使用相对旋转角，并统一使用 degree。
- [ ] 检查位置误差是否为三维欧氏距离，并统一使用 mm。
- [ ] 生成静态统计与轨迹统计两个独立对象，禁止字段复用。
- [ ] 将汇总 JSON、异常样本 CSV、运行日志和脚本 SHA 一并返回。

---

## 7. Completion Criteria / 完成标准

- [ ] 目录中每个非空轨迹 P95 都能在对应汇总 JSON 的 `trajectory_raw` 中逐字对应。
- [ ] 目录样本数与报告最终统计表的轨迹同步样本数一致。
- [ ] 静态 P95 不再显示在轨迹字段中。
- [ ] 原始与过滤后结果均保留，页面明确说明当前展示哪一种。
- [ ] 所有 `fail`、`pending`、`pass` 和 `smoke` 状态与报告内部一致。
- [ ] 所有正式设备具有可追溯的真实序列号，不含模板占位值。
- [ ] 所有报告具有采集时间、完成时间和生成时间，且三者字段名不混用。
- [ ] Quest 3 静态阶段与 E6 试运行要么补齐连续轨迹统计，要么继续在目录显示空值。

