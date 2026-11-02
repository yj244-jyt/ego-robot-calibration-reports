# 四设备时间戳对齐审计

生成时间：`2026-11-02T11:40:58.713216+00:00`

本审计冻结每份已发布报告的原始 Robot/VR 流、事件和标定矩阵。
候选偏移仅通过运动速度相关性估计，再用奇偶轨迹互换训练/验证；
正偏移表示在记录的 VR 时间戳上加时间。未通过交叉验证的偏移不用于最终比较。

## 主要结论

- DPVR 的低轨迹误差不能由当前可检出的固定时间偏移解释。其候选偏移未通过交叉验证，5 Hz 下修正前后基本不变。
- Quest 3 检出可重复的有效偏移，但修正只降低约 0.2–0.3 mm，远小于其与 DPVR 的差距。
- PICO 4 Ultra 和 E6 的候选偏移在留出轨迹上不能稳定改善，因此不接受固定偏移修正。
- DPVR 同时在静态误差、统一 5 Hz 轨迹误差和速度匹配误差上更低，当前证据支持真实的空间/跟踪精度收益，而不是单纯由采样率或计算错误造成。
- 该结论仍是诊断性结论：四设备没有在同一天、同一条自动轨迹上重测，WebXR 设备也缺少控制器原生采样时间戳。

## 最新四设备公平比较

| 设备 | 静态均值 | VR间隔P50/P95 | 接受的偏移 | 5 Hz轨迹均值 | 速度匹配均值 |
|---|---:|---:|---:|---:|---:|
| Meta Quest 3 | 3.424 mm | 17.05/34.06 ms | 15.00 ms | 8.312 mm | 10.068 mm |
| PICO 4 Ultra | 4.485 mm | 200.91/201.18 ms | 0.00 ms | 8.376 mm | 8.085 mm |
| Skyworth E6 | 8.558 mm | 33.33/33.33 ms | 0.00 ms | 9.134 mm | 9.552 mm |
| DPVR SDK4 | 2.492 mm | 14.42/15.46 ms | 0.00 ms | 3.673 mm | 3.537 mm |

速度匹配值对所有设备共同具备至少 20 个样本的速度区间等权平均，
避免高采样率设备或低速停留样本占比不同直接主导结果。

## 偏移验证

| 设备 | 候选偏移中位数 | 段间IQR | 两折验证 | 原始/候选修正5 Hz均值 | 判定 |
|---|---:|---:|---|---:|---|
| Meta Quest 3 | 15.00 ms | 15.00 ms | 通过 | 8.577/8.312 mm | `effective_shift_supported` |
| PICO 4 Ultra | -42.50 ms | 76.25 ms | 未通过 | 8.376/8.055 mm | `shift_candidate_not_cross_validated` |
| Skyworth E6 | -5.00 ms | 17.50 ms | 未通过 | 9.134/9.036 mm | `shift_candidate_not_cross_validated` |
| DPVR SDK4 | 5.00 ms | 20.00 ms | 未通过 | 3.673/3.669 mm | `shift_candidate_not_cross_validated` |

## 全站报告覆盖

| 报告 | 传输 | 模式 | VR记录数 | 时间模型 | 序列异常 | 状态 |
|---|---|---|---:|---|---:|---|
| Meta Quest 3 | `webpage_webxr` | `full` | 16663 | `host_receive_latest_webxr_pose` | 0 | `effective_shift_supported` |
| PICO 4 Ultra | `webpage_webxr` | `full` | 1975 | `host_receive_latest_webxr_pose` | 1 | `shift_candidate_not_cross_validated` |
| Skyworth E6 | `usb_cdc` | `full` | 10742 | `nearest_render_pose_relabelled_rgb` | 9 | `shift_candidate_not_cross_validated` |
| DPVR SDK4 | `usb_native_sdk` | `full` | 23646 | `host_midpoint` | 4 | `shift_candidate_not_cross_validated` |
| Meta Quest 3 (partial first test) | `webpage_webxr` | `full` | 13589 | `host_receive_latest_webxr_pose` | 0 | `inconclusive` |
| Skyworth E6 (first complete test) | `usb_cdc` | `full` | 12807 | `nearest_render_pose_relabelled_rgb` | 12 | `shift_candidate_not_cross_validated` |
| Skyworth E6 (6-pose smoke test) | `usb_cdc` | `packet_only` | 3962 | `nearest_render_pose_relabelled_rgb` | 5 | `packet_only` |
| Vive Tracker | 独立协议 | `excluded` | N/A | N/A | N/A | relative X-axis following protocol; no standardized Robot/hand-controller absolute-pose streams |

## 协议判断

- Quest 3 / PICO：使用 WebXR 最新位姿到达电脑的墙钟接收时间。它可与机械臂墙钟对齐，但不等于控制器原生采样时刻，浏览器预测、缓存和网络延迟会合并为有效 pose age。
- E6：USB CDC 四时间戳同步把设备时钟映射到电脑会话墙钟；映射残差可检查，但 `nearest_render_pose_relabelled_rgb` 仍不能证明位姿对应的原生采样年龄。
- DPVR：机械臂和 SDK 查询都使用同一电脑的 `CLOCK_REALTIME` 查询中点，同时保留 SDK 单调源时间做新鲜度检查。它的跨时钟不确定性最小，但查询时刻仍不是硬件内部曝光/融合时刻。
- 墙钟对齐解决的是时钟域问题；设备内部 pose age、预测和传输缓存必须通过原生时间戳或运动相关性另行验证。

## 判定规则

- `effective_shift_supported`：两个交叉验证方向都改善未参与估计的轨迹，才允许采用修正值。
- `shift_candidate_not_cross_validated`：相关性存在候选峰，但不能证明可泛化，最终结果保留零偏移。
- `packet_only`：报告没有可复算的完整绝对轨迹或标定证据，只检查时间字段、间隔、序列和时钟映射。

## 后续受控复测

1. 四设备执行同一条机械臂自动轨迹，固定速度、加速度、方向和持续时间。
2. 每个设备同时保存主机接收时间、查询前后时间、设备原生单调时间和原始序列号，禁止后处理覆盖原始字段。
3. 每条轨迹先用一半数据估计时延，再用另一半验证；不允许按最终误差反向挑选偏移。
4. 统一按 5 Hz、相同有效间隔和相同速度分布统计，并同时公布零偏移与交叉验证通过后的结果。
5. 若设备无法提供原生 pose 时间戳，在报告中明确标为有效运动延迟，不宣称为设备内部采样延迟。

## 限制

现有 Robot 流同样主要依赖主机查询墙钟，而不是控制器内部伺服时间；
固定时钟偏移和固定 pose age 在缺少双方原生时钟证据时不能完全分离。
旧报告中的异常轨迹、不同标定质量和人工拖拽差异也会影响跨设备比较。

