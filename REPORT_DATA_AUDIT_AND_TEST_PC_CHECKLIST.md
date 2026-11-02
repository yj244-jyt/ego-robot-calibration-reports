# Report Data Audit and Test-PC Verification / 报告数据审计与测试电脑核对清单

> Context / 背景：根据 `ego-robot-calibration-reports` 当前发布的 7 份报告，以及测试电脑返回的 `DEVICE_RAW_DATA_REVIEW_2026-11-02.md` 进行交叉审计。复核日期：2026-11-02。当前处置：已完成 E6、Quest 3 和 PICO 4 Ultra 的原始流与统计复核；目录统一展示未过滤轨迹平均误差。

## 1. Audit Summary / 审计摘要

- [x] PICO 4 Ultra 第二次测试具备完整的原始与过滤后连续轨迹统计。
- [x] Skyworth E6 第二次测试具备完整的原始与过滤后连续轨迹统计。
- [x] Meta Quest 3 第二次测试具备完整的原始连续轨迹统计，但过滤后统计没有完整列出 P95、RMSE 和样本数。
- [x] Skyworth E6 首次正式测试具备完整的原始连续轨迹统计，但过滤后统计没有完整列出 P95、RMSE 和样本数。
- [ ] Meta Quest 3 静态阶段报告没有连续轨迹统计；报告内部明确记录轨迹样本数为 0。
- [ ] Skyworth E6 试运行报告只提供 6 个测试姿态的汇总，不具备与正式报告相同的连续同步轨迹统计。
- [ ] Skyworth E6 首次正式测试的真实设备编号尚未在原始包中确认；原始适配器仍使用 `E6-CONTROLLER-REPLACE` 占位值。
- [ ] Vive Tracker 报告缺少原始数据文件、测试日期、Tracker 序列号和分析脚本版本，暂时不能在测试电脑上独立复算。
- [ ] 现有轨迹报告没有完整记录 P95 的分位数算法、有效样本掩码和跨轨迹聚合权重，因此尚不能仅根据页面数值排除计算口径问题。
- [ ] 手眼标定的原始训练拟合残差已重算，但页面仍未系统区分训练残差与独立留出误差；手眼外参的正式资格结论仍待留出验证和不确定度预算闭合。
- [x] 测试电脑已从保存的原始流独立复算 E6、Quest 3 和 PICO 4 Ultra 的静态与轨迹统计。
- [x] 三个当前正式测试的资格状态均为 `fail`；页面数值是诊断结果，不得表述为正式通过。
- [x] PICO 两轮数据具有同硬件、同 session、同 coordinate epoch 和同坐标重置矩阵的证据，22 点合并标定可用于当前诊断复核。
- [ ] E6 原始 16 点标定中 `c08` 残差为 196.08 mm / 20.41 deg，且尚未正式批准剔除；E6 标定资格仍失败。

目录页当前统一展示未过滤的连续轨迹统计：轨迹平均平移误差、轨迹平均旋转误差和轨迹同步样本数。没有完整轨迹统计的报告显示空值，不使用静态值代替。

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

### A. Why P95 Can Exceed the Mean / P95 为什么可以高于均值

P95 不是“最差 5% 样本的平均值”，而是把误差从小到大排序后，95% 样本不超过的分位点。均值则使用全部样本。当大多数样本很小，但有一段持续的高误差尾部时，P95 可以明显高于均值。

一个简化例子是：100 个样本中，94 个为 5 mm、1 个为 21 mm、5 个为 30 mm。均值只有 6.41 mm，但按 nearest-rank 定义的 P95 是 21 mm。这正是“多数样本小，少数尾部样本大”的结果。不同分位数插值方法可以产生轻微数值差异，所以必须一起记录算法。

Quest 3 第二次测试中，轨迹位置误差的中位数为 4.78 mm、均值为 8.98 mm、P95 为 20.96 mm、最大值为 174.98 mm。P95 约为均值的 2.33 倍。这组顺序 `P95 > 均值 > 中位数` 在右偏长尾分布中可以成立，但它只说明“统计上可能”，不能证明现有结果一定计算正确。

当前页面的分段结果已经显示高误差可能集中在少数轨迹段：

| 轨迹段 | 样本数 | 位置均值 | 位置最大值 |
|---|---:|---:|---:|
| `a11` | 662 | 38.79 mm | 174.98 mm |
| `a15` | 711 | 8.49 mm | 147.70 mm |
| `a09` | 862 | 7.86 mm | 64.48 mm |
| `a14` | 649 | 10.39 mm | 40.90 mm |

由于轨迹帧在时间上强相关，一次持续数百帧的跟踪错位、坐标跳变或时间错配会形成整段高误差，并把 P95 推高；它不一定只是一个孤立异常点。

### B. P95 Recalculation Checks / P95 重算核对项

- [ ] 导出所有逐帧位置误差和姿态误差，保留 `run_id`、轨迹段、帧号、两路时间戳、有效标志、tracking flags、插值跨度和 coordinate epoch。
- [ ] 记录 P95 的具体实现和参数，例如 NumPy `percentile(..., method="linear")`；禁止只写“P95”。
- [ ] 核对 P95 是在删除 NaN 和无效帧后计算，并确认单位转换发生在误差计算的正确阶段。
- [ ] 分别计算“全部有效帧混合”的微平均口径和“每段同权”的宏平均口径，不能将两者混用。
- [ ] 确认长轨迹段是否因帧数更多而获得更大权重，并同时报告每段样本数。
- [ ] 对原始和过滤后数据分别输出 P50、P75、P90、P95、P99 和最大值，同时生成直方图和经验累积分布图。
- [ ] 使用两个独立实现复算 P95，并对任何不一致记录分位数插值方法、输入长度和排序索引。
- [ ] 单独重算 `a11`、`a15`、`a09` 和 `a14`，检查高误差尾部是真实持续残差，还是时间戳、跟踪状态、插值或坐标系问题。

---

## 3. Cross-Report Trajectory Audit / 跨报告轨迹审计

| 报告 | 轨迹平均平移 | 轨迹平均旋转 | 同步样本 | 轨迹位置最大值 | 轨迹姿态最大值 | 目录处理 |
|---|---:|---:|---:|---:|---:|---|
| PICO 4 Ultra 第二次 | 8.340 mm | 0.657 deg | 2920 | 256.18 mm | 3.21 deg | 展示原始轨迹平均值 |
| Skyworth E6 第二次 | 9.099 mm | 1.895 deg | 2750 | 92.65 mm | 10.41 deg | 展示原始轨迹平均值 |
| Meta Quest 3 第二次 | 8.976 mm | 1.533 deg | 9824 | 174.98 mm | 6.49 deg | 展示原始轨迹平均值 |
| Meta Quest 3 静态阶段 | — | — | 0 | — | — | 显示缺失，不用静态值替代 |
| Skyworth E6 首次正式 | 7.68 mm | 2.07 deg | 12554 | 104.09 mm | 11.00 deg | 展示原始轨迹平均值 |
| Skyworth E6 试运行 | — | — | 0 | — | — | 显示缺失，不与正式轨迹横向比较 |
| Vive Tracker v5/v6/v7 | 高速同墙时 MAE 1.560 mm | 高速补偿 MAE 1.163 mm | 2705 个 Vive 源帧 | 4.685 mm | — | 保留专用动态平均值标签 |

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

## 4. Hand-Eye Calibration Recalculation / 手眼标定重算审计

下表优先采用测试电脑复核的原始标定训练残差；未被新复核覆盖的旧报告仍保留页面值。这些数值不视为已经验证的手眼精度。除非数值来自未参与求解的独立留出姿态，否则它们只是训练集拟合残差，不是外部泛化误差。

| 报告 | 页面标定姿态 | 平移均值 | 平移最大值 | 旋转均值 | 旋转最大值 | 待核对事项 |
|---|---:|---:|---:|---:|---:|---|
| PICO 4 Ultra 第二次 | 22 | 2.89 mm | 7.45 mm | 0.29 deg | 0.84 deg | 合并两轮姿态，`c01` 来自上一轮，`c15`/`c16` 被排除 |
| Skyworth E6 第二次 | 16 | 16.18 mm | 196.08 mm | 2.74 deg | 20.41 deg | 15 点修订解排除 `c08` 后平移均值为 4.26 mm，但剔除尚未正式批准 |
| Meta Quest 3 第二次 | 16 | 4.81 mm | 15.03 mm | 1.00 deg | 2.51 deg | `c13` 平移 15.03 mm；`c14`/`c15` 旋转 2.51 deg，`c16` 旋转 2.41 deg |
| Meta Quest 3 静态阶段 | 16 | 3.88 mm | 13.64 mm | 0.20 deg | 0.37 deg | `c14` 平移 13.64 mm |
| Skyworth E6 首次正式 | 16 | 4.05 mm | 8.45 mm | 1.05 deg | 4.12 deg | `c10` 为页面最大残差点 |

复核结果证实 E6 的原始标定存在超级异常点，所以 E6 的 8–14 mm 最终测试误差不能解释为纯手柄跟踪误差。Quest 3 的标定不确定度预算仍未闭合。PICO 的跨轮数据复用已有一致性证据，但硬件映射、夹具、时钟和机械臂基线等正式门禁仍为 pending。

### A. Definition and Frame Convention / 定义与坐标约定

- [ ] 保存完整的手眼标定方程和每个符号的 from/to frame，确认实际求解是否为 $AX = XB$。
- [ ] 记录 Robot base、flange、TCP、VR world、headset/controller/tracker 等坐标系的定义，并标明每个矩阵是 $T_{A\leftarrow B}$ 还是其逆变换。
- [ ] 逐项核对矩阵乘法顺序、逆矩阵方向、左右手系、轴方向与平移单位。
- [ ] 确认四元数顺序是 `xyzw` 还是 `wxyz`，求解前已归一化，并统一 degree/radian 与 m/mm。
- [ ] 明确“标定平移残差”和“标定旋转残差”的公式，确认它是 $AX$ 与 $XB$ 的残差、端点重投影误差，还是其他定义。

### B. Sampling and Time Pairing / 采样与时间配对

- [ ] 对每个静止姿态保留 Robot 和 VR 的全部原始时间戳，包括 source time、host time、clock offset 和 OpenXR 时间语义。
- [ ] 设置线速度、角速度和稳定时长阈值，删除机械臂到位后尚未完全稳定的样本。
- [ ] 每个姿态先计算一个稳健代表位姿，例如位置中位数与合法的四元数平均；不要把同一静止姿态的数千帧当成数千个独立标定方程。
- [ ] 保存每个姿态的原始帧数、有效帧数、离散度与协方差，标定时以“姿态”为权重单元，避免记录更久的姿态自动获得更高权重。

### C. Geometry and Solver Quality / 几何分布与求解质量

- [ ] 确认姿态在至少两个、最好三个旋转轴上具有足够基线，同时包含有效平移，删除近重复姿态。
- [ ] 输出观测矩阵的奇异值、条件数或等价的可观测性指标，不要只输出最终变换。
- [ ] 确认 Robot TCP/tool frame 定义、实际安装方向和 tracker/controller-to-TCP 杆臂长度，必要时独立测量物理安装尺寸。
- [ ] 使用原始全量、稳健损失和明确离群规则分别求解，对比外参差异和下游误差，不允许只保留人工选出的最优结果。

### D. Outliers and Cross-Validation / 离群点与交叉验证

- [ ] 任何被排除或替换的姿态必须保留原始记录、排除理由、操作人和会话标识。
- [ ] 除非能证明设备、安装、坐标 epoch 和 Robot TCP 定义完全未变，否则禁止用上一轮姿态替代当前轮姿态。
- [ ] 执行 leave-one-pose-out 或预留独立验证姿态，分别报告求解集残差和留出误差。
- [ ] 对姿态采样做 bootstrap，输出外参及验证误差的置信区间；若大量重采样退化，必须报告失败比例和原因。
- [ ] 对每个会话和姿态子集独立求解外参，检查变换是否随时间、重新定位或重新安装发生漂移。
- [ ] 用每个候选外参重算静态和轨迹误差，定量分离手眼标定对最终 P95 和均值的影响。

---

## 5. Per-Report Problems / 各报告问题

### A. PICO 4 Ultra Second Test / PICO 4 Ultra 第二次测试

- [x] 原始轨迹统计完整：2920 个同步样本。
- [x] 过滤后保留 2854 个样本，排除 66 个样本。
- [ ] 复核位置最大值 256.18 mm 对应的 3.1 s 时刻，确认是否为跟踪跳变、时间错配或外参异常。
- [ ] 重点检查 `a01`、`a09`、`a12`、`a15` 和 `a16`，页面记录这些轨迹包含被过滤样本。
- [x] 目录改为展示未过滤轨迹平均值：8.340 mm / 0.657 deg；P95 和过滤值仍在报告内保留。

### B. Skyworth E6 Second Test / Skyworth E6 第二次测试

- [x] 原始轨迹统计完整：2750 个同步样本。
- [x] 过滤后保留 2693 个样本，排除 57 个样本。
- [x] 已确认原始标定姿态 `c08` 残差为 196.081 mm / 20.407 deg，且修订解中的剔除尚未得到正式人工批准。
- [x] 目录改为展示未过滤轨迹平均值：9.099 mm / 1.895 deg。
- [ ] 复核轨迹位置最大值 92.65 mm 对应的 180.659915208 s 时刻。
- [ ] 确认静态报告中 16 个原始姿态与 15 个修订标定姿态的命名和用途，避免把两者样本数混用。

### C. Meta Quest 3 Second Test / Meta Quest 3 第二次测试

- [x] 原始轨迹统计完整：9824 个同步样本。
- [x] 原始位置统计为均值 8.98 mm、中位数 4.78 mm、P95 20.96 mm、最大值 174.98 mm。
- [x] 测试电脑复核值为 8.976 mm / 1.533 deg，目录状态按源报告 `acceptance.status` 从“待验收”更正为“未通过”。
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

## 6. Required Export Schema / 必需导出结构

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
  "statistics_policy": {
    "aggregation": "pooled_samples|equal_weight_segments|both",
    "quantile_implementation": "",
    "quantile_method": "",
    "valid_mask": "",
    "filter_order": []
  },
  "trajectory_raw": {
    "position_mm": {
      "mean": null,
      "rmse": null,
      "median": null,
      "p75": null,
      "p90": null,
      "p95": null,
      "p99": null,
      "max": null
    },
    "orientation_deg": {
      "mean": null,
      "rmse": null,
      "median": null,
      "p75": null,
      "p90": null,
      "p95": null,
      "p99": null,
      "max": null
    },
    "sample_count": 0,
    "segment_count": 0,
    "per_segment": []
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
  "hand_eye": {
    "equation": "",
    "frame_convention": {},
    "solver": "",
    "loss": "",
    "pose_count_raw": 0,
    "pose_count_used": 0,
    "representative_method": "",
    "weighting": "",
    "condition_number": null,
    "transform": {
      "from_frame": "",
      "to_frame": "",
      "translation_unit": "m|mm",
      "quaternion_order": "xyzw|wxyz",
      "matrix_4x4": null,
      "quaternion": null,
      "translation": null
    },
    "train_residual": {
      "position_mm": {},
      "orientation_deg": {}
    },
    "cross_validation": {
      "method": "",
      "position_mm": {},
      "orientation_deg": {}
    },
    "excluded_poses": []
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

## 7. Test-PC Verification Procedure / 测试电脑核对步骤

- [ ] 找到每个 `run_id` 对应的原始运行目录，不要从网页压缩后的可视化数组反推唯一真值。
- [ ] 记录分析脚本 Git SHA、Python 环境、依赖版本和命令行参数。
- [ ] 校验 Robot 与 VR 原始文件的 SHA-256，并与报告附录记录比较。
- [ ] 校验设备编号来源；禁止继续使用 `REPLACE`、`UNKNOWN` 或模板默认值发布正式报告。
- [ ] 分别记录采集开始、采集结束和报告生成时间。
- [ ] 检查 Robot 与 VR 的 timestamp domain、timestamp model、host offset 和 source timestamp。
- [ ] 逐段重建同步样本，记录插值跨度、数据年龄、tracking flags 和 coordinate epoch。
- [ ] 导出逐帧误差 CSV，至少包含 run、segment、frame index、Robot/VR 时间戳、有效状态、插值跨度、位置误差和姿态误差。
- [ ] 对未过滤样本计算 mean、RMSE、median、P95、maximum 和 sample count。
- [ ] 使用两个独立实现复算 P95，保存分位数方法，并输出 P50、P75、P90、P95、P99 和最大值。
- [ ] 同时输出全部帧池化聚合和每轨迹段等权聚合，并保存每段样本数、分位数、直方图与经验累积分布图。
- [ ] 按明确保存的过滤规则重算过滤后统计，并导出每个排除样本的原因。
- [ ] 检查统计是否按“全部同步样本”聚合，而不是先对每段取均值再二次平均。
- [ ] 检查角度误差是否使用相对旋转角，并统一使用 degree。
- [ ] 检查位置误差是否为三维欧氏距离，并统一使用 mm。
- [ ] 从原始静止帧重建每个标定姿态，保存稳定阈值、姿态代表方法、帧数、离散度和使用权重。
- [ ] 对手眼标定执行原始全量、稳健求解、leave-one-pose-out 和独立留出验证，分别报告训练残差与验证误差。
- [ ] 导出手眼变换矩阵、平移、四元数、坐标方向、求解器、损失函数、条件数、逐姿态残差与排除记录。
- [ ] 用每个候选手眼外参重算静态与轨迹统计，对比 mean、P95 和 maximum 如何变化。
- [ ] 生成静态统计与轨迹统计两个独立对象，禁止字段复用。
- [ ] 将汇总 JSON、异常样本 CSV、运行日志和脚本 SHA 一并返回。

---

## 8. Completion Criteria / 完成标准

- [x] 目录中每个非空轨迹平均值都与对应报告或复核结果的 `trajectory_raw.mean` 一致。
- [ ] 目录样本数与报告最终统计表的轨迹同步样本数一致。
- [x] 静态统计不再显示在目录轨迹字段中。
- [ ] 原始与过滤后结果均保留，页面明确说明当前展示哪一种。
- [ ] 所有 `fail`、`pending`、`pass` 和 `smoke` 状态与报告内部一致。
- [ ] 所有正式设备具有可追溯的真实序列号，不含模板占位值。
- [ ] 所有报告具有采集时间、完成时间和生成时间，且三者字段名不混用。
- [ ] Quest 3 静态阶段与 E6 试运行要么补齐连续轨迹统计，要么继续在目录显示空值。
- [ ] 任何 P95 都能从逐帧 CSV、有效样本掩码和已记录的分位数方法精确复现。
- [ ] Quest 3 第二次测试中 P95 约为均值 2.33 倍的原因能定位到具体轨迹段、时间区间和原始采样状态。
- [ ] 手眼标定的训练残差与留出误差分开报告，且每个数值都能追溯到使用的姿态集、权重和求解器。
- [ ] 不存在没有会话来源、安装一致性证据和理由的跨轮姿态替换。
- [ ] 手眼矩阵的坐标方向、单位、四元数顺序和残差定义在原始导出、重算脚本与报告中完全一致。

