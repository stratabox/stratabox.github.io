/* StrataBox website data store (verified bilingual content & empirical benchmarks). */
(function () {
  "use strict";

  const COLORS = {
    top: "#FF9F1D",
    mid: "#4090A5",
    bot: "#2E427C",
    wordmark: "#3A3E43",
  };

  const I18N = {
    en: {
      "nav.architecture": "Architecture",
      "nav.backends": "Backends",
      "nav.storage": "Storage",
      "nav.benchmarks": "Benchmarks",
      "nav.quickstart": "Quick start",
      "nav.github": "GitHub",

      "hero.title": "Elastic sandboxes built for agent scale",
      "hero.subtitle":
        "Compose immutable Linux layers, page 256 KiB chunks on demand, and isolate thousands of agent rollouts from one Rust and Python runtime.",
      "hero.cta": "Get started",
      "hero.stageHint": "Select a stratum to inspect the runtime stack",

      "backends.title": "One runtime across four isolation boundaries",
      "backends.subtitle":
        "Route stateless functions, stateful containers, Firecracker microVMs, and full KVM virtual machines through one async Python SDK.",
      "backends.matrixTitle": "Backend comparison",

      "storage.title": "Load only the blocks each rollout touches",
      "storage.subtitle":
        "Rollouts read 4.2% to 13.3% of an image. Prefetch compact EROFS metadata locally and page 256 KiB chunks through pure-Rust FUSE.",
      "storage.pillarsTitle": "Three storage primitives",

      "benchmarks.title": "Pack dense sandboxes without noisy neighbors",
      "benchmarks.subtitle":
        "Measured on bare-metal Linux 7.0 via stratabox-daemon bench, reproducing all four quantitative suites from arXiv:2609.22978.",
      "benchmarks.hostNote":
        "Measured on bare-metal Linux 7.0.0-43-generic, AMD Ryzen 7 8845H (8 cores / 16 SMT threads, 28 GiB RAM), Firecracker v1.18.0, QEMU 10.2.1.",

      "security.title": "Confine untrusted root workloads in depth",
      "security.subtitle":
        "Six verified kernel and runtime controls neutralize real reward-hacking vectors observed during large-scale agentic RL runs.",

      "routing.title": "Zero-state routing encoded in every sandbox ID",
      "routing.subtitle":
        "ApiServer holds zero per-sandbox state. It extracts the owning edge node in O(1) with zero allocations and survives restarts without interrupting live sandboxes.",
      "routing.inputLabel": "Inspect sandbox identifier",

      "quickstart.title": "Start a local cluster in three commands",
      "quickstart.subtitle":
        "Build the Rust binaries, launch a multi-edge local cluster, import OCI images into chunked EROFS layers, and drive workloads from Python.",
      "quickstart.cratesTitle": "Workspace architecture",

      "footer.tagline":
        "High-density, composable elastic sandbox infrastructure in Rust and Python.",
      "footer.docs": "Architecture docs",
      "footer.benchmarks": "Benchmark report",
      "footer.paper": "DSec paper (arXiv:2609.22978)",
      "footer.license": "MIT OR Apache-2.0",
      "footer.citeTitle": "Cite the architecture",
      "footer.copyBibtex": "Copy BibTeX",
      "footer.copied": "Copied",
    },
    zh: {
      "nav.architecture": "系统架构",
      "nav.backends": "执行后端",
      "nav.storage": "分层存储",
      "nav.benchmarks": "性能基准",
      "nav.quickstart": "快速开始",
      "nav.github": "GitHub",

      "hero.title": "为智能体规模而生的弹性沙箱",
      "hero.subtitle":
        "基于统一 Rust 与 Python 运行时，组合不可变 Linux 镜像层、按需加载 256 KiB 数据块，高密度隔离数千并发智能体环境。",
      "hero.cta": "快速开始",
      "hero.stageHint": "点击任意层级查看运行时技术栈",

      "backends.title": "一套运行时驱动四层隔离边界",
      "backends.subtitle":
        "通过统一的异步 Python SDK 调度无状态函数、有状态容器、Firecracker 微虚拟机与完整 KVM 虚拟机。",
      "backends.matrixTitle": "执行后端能力对比",

      "storage.title": "只加载每次推理真正触及的数据块",
      "storage.subtitle":
        "单次 Rollout 仅读取镜像 4.2% 至 13.3% 的数据。本地预取轻量 EROFS 元数据，并通过纯 Rust FUSE 按需拉取 256 KiB 数据块。",
      "storage.pillarsTitle": "三大核心存储原语",

      "benchmarks.title": "高密度混部同时守住延迟确定性",
      "benchmarks.subtitle":
        "基于裸金属 Linux 7.0 通过 stratabox-daemon bench 实测，完整复现 arXiv:2609.22978 全部四组定量基准。",
      "benchmarks.hostNote":
        "实测环境：裸金属 Linux 7.0.0-43-generic，AMD Ryzen 7 8845H（8 核 16 线程，28 GiB 内存），Firecracker v1.18.0，QEMU 10.2.1。",

      "security.title": "面向不可信 Root 负载的纵深隔离",
      "security.subtitle":
        "六层经红队实测验证的内核与运行时防线，全面阻断大规模智能体强化学习中的奖励黑客攻击面。",

      "routing.title": "将零状态路由直接编码进每个沙箱 ID",
      "routing.subtitle":
        "ApiServer 不保存任何单沙箱状态，以 O(1) 零堆分配直接解析目标计算节点，控制面重启对运行中沙箱零影响。",
      "routing.inputLabel": "输入或选择沙箱标识符",

      "quickstart.title": "三条命令启动完整本地沙箱集群",
      "quickstart.subtitle":
        "编译 Rust 二进制、拉起多节点本地集群、离线转换 OCI 镜像为分块 EROFS 层，并通过异步 Python SDK 编排负载。",
      "quickstart.cratesTitle": "工作区架构与组件地图",

      "footer.tagline":
        "基于 Rust 与 Python 构建的高密度可组合弹性沙箱基础设施。",
      "footer.docs": "架构文档",
      "footer.benchmarks": "基准测试报告",
      "footer.paper": "DSec 论文 (arXiv:2609.22978)",
      "footer.license": "MIT / Apache-2.0 双许可",
      "footer.citeTitle": "引用参考架构",
      "footer.copyBibtex": "复制 BibTeX",
      "footer.copied": "已复制",
    },
  };

  const UI = {
    en: {
      copy: "Copy",
      copied: "Copied",
      flowLabel: "Request flow",
      boundary: "Isolation boundary",
      storage: "Rootfs and storage",
      control: "Control channel",
      latency: "Startup latency",
      reclaim: "Memory reclamation",
      workloads: "Target workloads",
      threat: "Observed attack vector",
      defense: "StrataBox defense",
      kernelRef: "Kernel primitive",
      burstLatency: "Burst latency (16 sandboxes)",
      remoteBytes: "Remote bytes pulled",
      diskWrites: "Local disk writes",
      speedup: "Speedup vs. eager pull",
      chunksFetched: "Fetched on demand",
      chunksCached: "Node L2 cache hit",
      chunksWasted: "Unpacked but unread",
      chunksUntouched: "Skipped remote blocks",
      workingSet: "Working set: 5 of 64 chunks (7.81%)",
      prefix: "Prefix",
      edgeNode: "Home edge node",
      backendCode: "Backend code",
      uid: "Sandbox UID",
      directRoute: "O(1) direct proxy target",
      invalidId:
        "Expected format: stratabox-<edge_id>-<fn|ctr|uvm|vm>-<uid> (hyphen-free UID).",
      parseOk: "Zero-allocation O(1) match",
      diagramHost: "Host control",
      diagramChannel: "Channel",
      diagramGuest: "Isolated guest",
      diagramStorage: "Storage stack",
    },
    zh: {
      copy: "复制",
      copied: "已复制",
      flowLabel: "请求流路径",
      boundary: "隔离边界",
      storage: "根文件系统与存储",
      control: "控制通道",
      latency: "典型启动延迟",
      reclaim: "内存回收机制",
      workloads: "适用工作负载",
      threat: "实测攻击向量",
      defense: "StrataBox 防御机制",
      kernelRef: "内核原语",
      burstLatency: "突发延迟（16 并发沙箱）",
      remoteBytes: "远端拉取字节数",
      diskWrites: "本地磁盘写入量",
      speedup: "相对全量拉取加速比",
      chunksFetched: "按需拉取块",
      chunksCached: "节点 L2 缓存命中",
      chunksWasted: "无效解压未读块",
      chunksUntouched: "跳过未拉取远端块",
      workingSet: "实际读取工作集：64 块中的 5 块（7.81%）",
      prefix: "协议前缀",
      edgeNode: "归属计算节点",
      backendCode: "后端编码",
      uid: "沙箱唯一标识",
      directRoute: "O(1) 直连代理目标",
      invalidId:
        "格式要求：stratabox-<edge_id>-<fn|ctr|uvm|vm>-<uid>（UID 不含连字符）。",
      parseOk: "O(1) 零堆分配解析成功",
      diagramHost: "宿主机控制",
      diagramChannel: "控制通道",
      diagramGuest: "隔离执行域",
      diagramStorage: "存储分层",
    },
  };

  const STRATABOX_LAYERS = {
    top: {
      accent: COLORS.top,
      en: {
        tab: "Execution and control",
        title: "Unified async SDK and stateless control plane",
        summary:
          "stratabox orchestrates batch RL rollouts with exponential backoff, Power-of-k placement, O(1) SandboxId routing, and a sub-5 ms FnCall warm Python pool.",
        flowStep: "stratabox -> IAM -> ApiServer (O(1) route) -> Edge daemon",
        specs: [
          { label: "Warm FnCall latency", value: "< 5 ms end-to-end" },
          { label: "Cluster state", value: "Zero per-sandbox DB state" },
          { label: "Batch rollouts", value: "SandboxGroup + 503/429 retry" },
        ],
      },
      zh: {
        tab: "执行与控制面",
        title: "统一异步 SDK 与零状态集群控制面",
        summary:
          "stratabox 编排高并发强化学习批量 Rollout，结合指数退避重试、Power-of-k 调度、O(1) 沙箱 ID 路由以及低于 5 ms 的 FnCall 预热进程池。",
        flowStep: "stratabox -> IAM -> ApiServer (O(1) 路由) -> Edge 节点",
        specs: [
          { label: "FnCall 暖池延迟", value: "< 5 ms 端到端" },
          { label: "控制面状态", value: "零单沙箱持久化状态" },
          { label: "批量编排", value: "SandboxGroup + 503/429 重试" },
        ],
      },
    },
    mid: {
      accent: COLORS.mid,
      en: {
        tab: "Composable storage",
        title: "Loop-free EROFS composition and 256 KiB FUSE paging",
        summary:
          "Stack read-only Base, Workspace, and Toolkit layers via OverlayFS while fuse.stratabox fetches only touched 256 KiB chunks into a persistent node-local L2 cache.",
        flowStep: "meta.erofs (local stat) -> fuse.stratabox (256 KiB) -> OverlayFS",
        specs: [
          { label: "Burst speedup", value: "30.36x warm L2 / 2.93x cold" },
          { label: "Metadata stat() I/O", value: "0 remote data chunk reads" },
          { label: "Write reduction", value: "27.18x lower vs. tar.gz unpack" },
        ],
      },
      zh: {
        tab: "可组合存储",
        title: "零 Loop 原生 EROFS 分层与 256 KiB 按需分页",
        summary:
          "通过 OverlayFS 动态叠加只读 Base、Workspace 与 Toolkit 层，fuse.stratabox 按需拉取触及的 256 KiB 数据块并落盘至节点持久化 L2 缓存。",
        flowStep: "meta.erofs (本地 stat) -> fuse.stratabox (256 KiB) -> OverlayFS",
        specs: [
          { label: "突发启动加速", value: "30.36x 热缓存 / 2.93x 冷缓存" },
          { label: "元数据 stat() 读取", value: "0 次远端数据块拉取" },
          { label: "磁盘写入削减", value: "较 tar.gz 解压降低 27.18 倍" },
        ],
      },
    },
    bot: {
      accent: COLORS.bot,
      en: {
        tab: "Kernel and KVM isolation",
        title: "Multi-layer confinement, DAX sharing, and core scheduling",
        summary:
          "Isolate untrusted root agents with namespaces, Firecracker/QEMU KVM, cgroup v2 eBPF firewalls, AppArmor, Landlock v8, Seccomp-BPF, and PR_SCHED_CORE QoS.",
        flowStep: "eBPF + AppArmor + Landlock v8 -> KVM / Namespaces -> PR_SCHED_CORE",
        specs: [
          { label: "Memory sharing", value: "76.7% lower host PSS at N=8" },
          { label: "MicroVM pause", value: "100% VMM RAM freed, 30 ms restore" },
          { label: "SMT QoS protection", value: "SCHED_IDLE + PR_SCHED_CORE" },
        ],
      },
      zh: {
        tab: "内核与虚拟化隔离",
        title: "多层内核围栏、DAX 内存共享与超线程核调度",
        summary:
          "融合 Linux Namespaces、Firecracker/QEMU KVM、cgroup v2 eBPF 防火墙、AppArmor、Landlock v8、Seccomp-BPF 与 PR_SCHED_CORE，全面加固不可信负载。",
        flowStep: "eBPF + AppArmor + Landlock v8 -> KVM / Namespaces -> PR_SCHED_CORE",
        specs: [
          { label: "页缓存共享", value: "8 并发宿主机 PSS 降低 76.7%" },
          { label: "微虚拟机暂停", value: "释放 100% 内存，30 ms 恢复" },
          { label: "超线程 QoS", value: "SCHED_IDLE + PR_SCHED_CORE" },
        ],
      },
    },
  };

  const BACKENDS = {
    fncall: {
      id: "fncall",
      accent: COLORS.top,
      filename: "fncall_warm_pool.py",
      code: `from stratabox import StrataBoxClient, StrataBoxFnCallArgs

async with StrataBoxClient(
    endpoint="http://127.0.0.1:18080",
    token="stratabox-root-token",
) as client:
    # Sub-5 ms warm Python pool (or GPU/MIG lease)
    fn = await client.run_fncall(
        StrataBoxFnCallArgs(
            language="python",
            code="print(6 * 7)",
            use_warm_python=True,
            gpu_mode="none",
        )
    )
    print(fn.stdout.strip(), f"warm={fn.warm_hit}")`,
      en: {
        tab: "FnCall",
        title: "Stateless fast path with warm Python and GPU pools",
        summary:
          "Container-isolated worker slots paired with pre-warmed Python 3 interpreters bypass the session multiplexer completely, delivering sub-5 ms invocations and lease-based NVIDIA GPU/MIG execution.",
        boundary:
          "Isolated container slot + warm Python worker pool + GPU/MIG lease",
        storage: "Read-only base rootfs + ephemeral tmpfs scratch workspace",
        control: "Private anonymous pipes (bypasses aether and chronus)",
        latency: "< 5 ms (warm pool hit)",
        reclaim: "Immediate stateless workspace reset on completion",
        workloads:
          "Competitive programming judges, single-file snippets, GPU kernel benchmarks",
        diagram: {
          host: "Edge warm pool",
          channel: "Anonymous pipe",
          guest: "Pre-warmed Python worker",
          storage: "Read-only rootfs + tmpfs",
        },
      },
      zh: {
        tab: "FnCall",
        title: "内置预热 Python 与 GPU 池的无状态极速通道",
        summary:
          "容器化工作槽叠加常驻预热 Python 3 进程池，完全旁路会话多路复用器开销，提供低于 5 ms 的热命中延迟，并支持 NVIDIA GPU 与 MIG 租约调度。",
        boundary: "独立容器工作槽 + 常驻 Python 进程池 + GPU/MIG 设备租约",
        storage: "隔离只读根文件系统 + 内存态 tmpfs 临时工作区",
        control: "私有匿名管道（跳过 aether 与 chronus）",
        latency: "< 5 ms（暖池命中）",
        reclaim: "单次调用结束即刻复位工作区",
        workloads: "算法判题（OJ）、单文件编译运行、GPU 算子微基准测试",
        diagram: {
          host: "Edge 暖池调度",
          channel: "匿名管道直连",
          guest: "预热 Python 工作进程",
          storage: "只读根 + tmpfs 临时层",
        },
      },
    },
    container: {
      id: "container",
      accent: COLORS.mid,
      filename: "container_rollout.py",
      code: `from stratabox import (
    StrataBoxClient,
    StrataBoxContainerRunArgs,
)

ctr_args = StrataBoxContainerRunArgs(
    container_image="base:default",
    workspace_layers=["ws/swe-django-11099:v1"],
    toolkit_layers=["tk/deepseek-harness:v4.1"],
    memory_limit_mb=1024,
    cpu_cores_limit=2,
    qos_class="LS",
    network_rules={"pypi": True, "npm": False},
)
async with await client.run_container(
    ctr_args
) as sandbox:
    # Freeze cgroup and reclaim resident pages
    paused = await sandbox.pause()
    # Transparent auto-resume on next RPC
    res = await sandbox.run_shell("uname -srm")
    await sandbox.update_network_rules(
        {"pypi": False, "npm": False}
    )
    packed = await sandbox.pack_diff(
        layer_id="ws/my-built-env:v1",
        scrub_paths=["/tmp/build_secret.txt"],
    )`,
      en: {
        tab: "Container",
        title: "Zero-alloc post-fork stateful Linux containers",
        summary:
          "Native Linux namespaces and pivot_root combine composable EROFS layers, live-reloaded cgroup v2 eBPF firewalls, AppArmor and Landlock v8 confinement, and transparent pause/auto-resume.",
        boundary:
          "Linux namespaces + pivot_root + AppArmor + Landlock v8 + Seccomp-BPF + eBPF",
        storage:
          "Composable read-only EROFS (fuse.stratabox 256 KiB paging) + OverlayFS",
        control: "Pre-pivot_root hidden AF_UNIX socket (--listen-fd 3)",
        latency: "~15-30 ms",
        reclaim:
          "Cold file-page eviction + cgroup.freeze + MADV_PAGEOUT + memory.reclaim",
        workloads:
          "SWE-bench repo repair, multi-turn terminal agents, toolchain builds",
        diagram: {
          host: "Edge admission + cgroup v2",
          channel: "Hidden UDS (--listen-fd 3)",
          guest: "Namespaces + stratabox-agent",
          storage: "EROFS Base/WS/TK + OverlayFS",
        },
      },
      zh: {
        tab: "Container",
        title: "零堆分配启动路径的轻量有状态容器",
        summary:
          "基于原生 Linux Namespaces 与 pivot_root 构建，融合可组合 EROFS 分层、热更新 cgroup v2 eBPF 防火墙、AppArmor 与 Landlock v8 围栏及透明抢占唤醒。",
        boundary:
          "Linux Namespaces + pivot_root + AppArmor + Landlock v8 + Seccomp-BPF + eBPF",
        storage: "可组合只读 EROFS（fuse.stratabox 256 KiB 按需加载）+ OverlayFS",
        control: "pivot_root 前预绑定隐藏 AF_UNIX 套接字（--listen-fd 3）",
        latency: "~15-30 ms",
        reclaim: "冷文件页驱逐 + cgroup.freeze + MADV_PAGEOUT + memory.reclaim",
        workloads: "SWE-bench 仓库级修复、多轮终端智能体、工具链构建",
        diagram: {
          host: "Edge 准入 + cgroup v2",
          channel: "隐藏 UDS (--listen-fd 3)",
          guest: "Namespaces + stratabox-agent",
          storage: "EROFS 分层 + OverlayFS",
        },
      },
    },
    microvm: {
      id: "microvm",
      accent: COLORS.bot,
      filename: "microvm_snapshot.py",
      code: `from stratabox import (
    StrataBoxClient,
    StrataBoxMicroVmRunArgs,
)

async with StrataBoxClient(
    endpoint="http://127.0.0.1:18080",
    token="stratabox-root-token",
) as client:
    # Firecracker v1.18+ KVM + snapshot pause
    args = StrataBoxMicroVmRunArgs(
        memory_limit_mb=256,
        cpu_cores_limit=2,
    )
    async with await client.run_microvm(args) as uvm:
        await uvm.run_shell(
            "echo GUEST_STATE_OK > /tmp/state.txt"
        )
        # Snapshots VM state and exits VMM (0 RAM)
        await uvm.pause()
        # Transparently restores in ~14-30 ms
        res = await uvm.run_shell(
            "cat /tmp/state.txt"
        )
        print("Restored:", res.stdout.strip())`,
      en: {
        tab: "MicroVm",
        title: "Firecracker KVM microVMs with 100% RAM reclamation",
        summary:
          "Direct uncompressed vmlinux boot on Firecracker v1.18+ pairs virtio-pmem DAX page sharing and DAMON balloon reporting with snapshot pause that terminates the VMM and restores in 14-30 ms.",
        boundary:
          "Firecracker v1.18+ KVM microVM + virtio-mmio + virtio-pmem DAX",
        storage:
          "Shared EROFS/virtio-pmem DAX + 256 KiB CoW block device (/dev/loopN)",
        control: "Firecracker vsock UDS multiplexed handshake",
        latency: "~310 ms (cold boot) / ~14-30 ms (snapshot restore)",
        reclaim:
          "Guest DAMON + Balloon Order-9 FPR; pause() snapshots and exits VMM (100% RAM freed)",
        workloads:
          "Untrusted root or kernel security tasks, high-risk code, Docker-in-VM",
        diagram: {
          host: "Firecracker v1.18+ VMM",
          channel: "vsock UDS multiplex",
          guest: "Guest kernel + stratabox-agent",
          storage: "virtio-pmem DAX + CoW block",
        },
      },
      zh: {
        tab: "MicroVm",
        title: "支持 100% 内存释放的 Firecracker KVM 微虚拟机",
        summary:
          "集成 Firecracker v1.18+ 直启内核，结合 virtio-pmem DAX 页缓存共享与 DAMON 气球回收；暂停时导出快照并退出 VMM 释放全部宿主机内存，下次请求 14-30 ms 透明恢复。",
        boundary: "Firecracker v1.18+ KVM 微虚拟机 + virtio-mmio + virtio-pmem DAX",
        storage: "共享 EROFS / virtio-pmem DAX + 256 KiB CoW 块设备（/dev/loopN）",
        control: "Firecracker vsock UDS 多路复用握手协议",
        latency: "~310 ms（冷启动）/ ~14-30 ms（快照恢复）",
        reclaim:
          "客户机 DAMON + Balloon Order-9 FPR；pause() 导出快照并退出 VMM（释放 100% 内存）",
        workloads: "内核或 Root 权限安全攻防、不可信高危代码、Docker-in-VM",
        diagram: {
          host: "Firecracker v1.18+ VMM",
          channel: "vsock UDS 多路复用",
          guest: "独立客户机内核 + stratabox-agent",
          storage: "virtio-pmem DAX + CoW 块设备",
        },
      },
    },
    fullvm: {
      id: "fullvm",
      accent: COLORS.bot,
      filename: "fullvm_desktop.py",
      code: `from stratabox import StrataBoxClient, StrataBoxVmRunArgs

async with StrataBoxClient(
    endpoint="http://127.0.0.1:18080",
    token="stratabox-root-token",
) as client:
    # QEMU/KVM (q35) + AF_VSOCK + virtio-gpu DRM
    args = StrataBoxVmRunArgs(
        vm_image="base:fullvm",
        memory_limit_mb=2048,
        cpu_cores_limit=4,
        qos_class="BE",
    )
    async with await client.run_vm(args) as vm:
        res = await vm.run_shell(
            "ls -l /dev/dri/card0 && uname -r"
        )
        print(res.stdout.strip())`,
      en: {
        tab: "FullVm",
        title: "Full QEMU/KVM virtualization with DRM graphics",
        summary:
          "Boot composable read-only rootfs layers or complete qcow2 and raw OS disk images on QEMU/KVM (q35,accel=kvm) with native AF_VSOCK control, QMP live state snapshots, and virtio-gpu-pci DRM.",
        boundary:
          "QEMU/KVM (q35,accel=kvm) + virtio-pmem DAX + virtio-gpu-pci DRM",
        storage:
          "Composable rootfs layers or full qcow2/raw OS disk + CoW block snapshots",
        control: "Native kernel /dev/vhost-vsock (AF_VSOCK)",
        latency: "~800-1200 ms",
        reclaim:
          "Guest DAMON + Balloon FPR; QMP stop + state migration snapshot to disk",
        workloads:
          "OSWorld and WebArena GUI agents, custom OS kernels, DRM graphics rendering",
        diagram: {
          host: "QEMU/KVM (q35)",
          channel: "Kernel AF_VSOCK",
          guest: "Full OS + virtio-gpu DRM",
          storage: "qcow2/raw disk + CoW snapshots",
        },
      },
      zh: {
        tab: "FullVm",
        title: "支持 DRM 图形渲染的完整 QEMU/KVM 虚拟机",
        summary:
          "基于 QEMU/KVM（q35,accel=kvm）启动可组合根文件系统或完整 qcow2/raw 操作系统磁盘镜像，集成内核原生 AF_VSOCK 控制、QMP 状态快照与 virtio-gpu-pci 图形渲染。",
        boundary: "QEMU/KVM (q35,accel=kvm) + virtio-pmem DAX + virtio-gpu-pci DRM",
        storage: "分层只读根文件系统或完整 qcow2/raw 磁盘镜像 + CoW 块快照",
        control: "内核 /dev/vhost-vsock 原生 AF_VSOCK",
        latency: "~800-1200 ms",
        reclaim: "客户机 DAMON + Balloon FPR；QMP 暂停并落盘状态迁移快照",
        workloads: "OSWorld / WebArena 桌面智能体、异构完整操作系统、DRM 图形渲染",
        diagram: {
          host: "QEMU/KVM (q35)",
          channel: "内核原生 AF_VSOCK",
          guest: "完整 OS + virtio-gpu DRM",
          storage: "qcow2/raw 镜像 + CoW 快照",
        },
      },
    },
  };

  const BACKEND_MATRIX = {
    headers: {
      en: [
        "Backend",
        "Isolation",
        "Storage",
        "Control channel",
        "Startup",
        "Best for",
      ],
      zh: ["后端", "隔离边界", "根文件系统与存储", "控制通道", "典型启动", "适用场景"],
    },
    rows: [
      {
        id: "fncall",
        name: "FnCall",
        en: [
          "FnCall",
          "Container slot + warm Python pool + GPU/MIG lease",
          "Read-only rootfs + ephemeral tmpfs",
          "Anonymous pipes",
          "< 5 ms (warm)",
          "OJ judges, snippets, GPU kernel benchmarks",
        ],
        zh: [
          "FnCall",
          "容器槽 + 预热 Python 池 + GPU/MIG 租约",
          "只读根 + 内存态 tmpfs",
          "匿名管道直连",
          "< 5 ms（暖池）",
          "算法判题、单文件运行、GPU 算子基准",
        ],
      },
      {
        id: "container",
        name: "Container",
        en: [
          "Container",
          "Namespaces + pivot_root + AppArmor + Landlock v8 + Seccomp + eBPF",
          "Composable EROFS (256 KiB FUSE) + OverlayFS",
          "Hidden UDS (--listen-fd 3)",
          "~15-30 ms",
          "SWE-bench repair, multi-turn agents, builds",
        ],
        zh: [
          "Container",
          "Namespaces + pivot_root + AppArmor + Landlock v8 + Seccomp + eBPF",
          "可组合 EROFS（256 KiB FUSE）+ OverlayFS",
          "隐藏 UDS (--listen-fd 3)",
          "~15-30 ms",
          "SWE-bench 修复、多轮终端代理、工具链构建",
        ],
      },
      {
        id: "microvm",
        name: "MicroVm",
        en: [
          "MicroVm",
          "Firecracker v1.18+ KVM + virtio-mmio + DAX",
          "Shared EROFS DAX + 256 KiB CoW block",
          "vsock UDS multiplex",
          "~310 ms / ~14-30 ms restore",
          "Untrusted root, kernel exploits, Docker-in-VM",
        ],
        zh: [
          "MicroVm",
          "Firecracker v1.18+ KVM + virtio-mmio + DAX",
          "共享 EROFS DAX + 256 KiB CoW 块设备",
          "vsock UDS 多路复用",
          "~310 ms / ~14-30 ms 恢复",
          "内核/Root 安全攻防、高危代码、Docker-in-VM",
        ],
      },
      {
        id: "fullvm",
        name: "FullVm",
        en: [
          "FullVm",
          "QEMU/KVM (q35) + virtio-pmem DAX + virtio-gpu DRM",
          "Composable rootfs or full qcow2/raw disk",
          "Kernel AF_VSOCK",
          "~800-1200 ms",
          "OSWorld/WebArena GUI, custom OS, DRM graphics",
        ],
        zh: [
          "FullVm",
          "QEMU/KVM (q35) + virtio-pmem DAX + virtio-gpu DRM",
          "分层根或完整 qcow2/raw 磁盘",
          "内核原生 AF_VSOCK",
          "~800-1200 ms",
          "OSWorld/WebArena 桌面代理、异构 OS、图形渲染",
        ],
      },
    ],
  };

  const ACTIVE_CELLS = [3, 12, 27, 41, 52];

  const PAGING_MODES = {
    eager: {
      latencyMs: 334,
      latencyText: "334 ms",
      speedup: "1.00x",
      remoteMiB: 79.59,
      remoteText: "79.59 MiB",
      diskWritesMiB: 707.59,
      diskWritesText: "707.59 MiB",
      statRemoteReads: 128,
      fetchedCells: 64,
      cachedCells: 0,
      usefulCells: 5,
      wastedCells: 59,
      activeIndices: ACTIVE_CELLS,
      en: {
        tab: "Eager tar.gz pull",
        summary:
          "Pulls and unpacks every block across all 16 sandboxes upfront, wasting 87% to 96% of transferred bytes and amplifying local disk writes to 707.59 MiB.",
        statNote:
          "Full archive unpack touches all 64 blocks before the first command executes.",
      },
      zh: {
        tab: "全量 tar.gz 拉取",
        summary:
          "启动前将全部 16 个沙箱镜像完整拉取并解压，87% 至 96% 的传输数据从未被读取，本地磁盘写入放大至 707.59 MiB。",
        statNote: "首条命令执行前需先完整解包全部 64 个数据块。",
      },
    },
    cold: {
      latencyMs: 114,
      latencyText: "114 ms",
      speedup: "2.93x",
      remoteMiB: 10.08,
      remoteText: "10.08 MiB (-87.3%)",
      diskWritesMiB: 10.08,
      diskWritesText: "10.08 MiB (-98.6%)",
      statRemoteReads: 0,
      fetchedCells: 5,
      cachedCells: 5,
      usefulCells: 5,
      wastedCells: 0,
      activeIndices: ACTIVE_CELLS,
      en: {
        tab: "StrataBox on-demand (cold L2)",
        summary:
          "Prefetched local meta.erofs serves all 128 stat() lookups with zero remote reads while fuse.stratabox singleflight-fetches only the 5 touched 256 KiB chunks (40 chunks across 4 images, 292 L2 hits).",
        statNote:
          "128 metadata stat() probes served from local meta.erofs with 0 remote chunk reads.",
      },
      zh: {
        tab: "StrataBox 按需分页（冷 L2）",
        summary:
          "本地预取的 meta.erofs 零远端读取承接全部 128 次 stat() 查询，fuse.stratabox 通过 Singleflight 仅拉取 5 个触及的 256 KiB 块（4 镜像共拉取 40 块，命中 L2 缓存 292 次）。",
        statNote: "128 次元数据 stat() 探测全部命中本地 meta.erofs，0 次远端数据块读取。",
      },
    },
    warm: {
      latencyMs: 11,
      latencyText: "11 ms",
      speedup: "30.36x",
      remoteMiB: 0.0,
      remoteText: "0.00 MiB (-100.0%)",
      diskWritesMiB: 0.0,
      diskWritesText: "0.00 MiB (-100.0%)",
      statRemoteReads: 0,
      fetchedCells: 0,
      cachedCells: 5,
      usefulCells: 5,
      wastedCells: 0,
      activeIndices: ACTIVE_CELLS,
      en: {
        tab: "StrataBox on-demand (warm L2)",
        summary:
          "Every working-set 256 KiB chunk hits the persistent node-local L2 cache (336 cache hits, 0 remote chunks pulled), launching 16 concurrent sandboxes in 11 ms.",
        statNote:
          "336 node L2 cache hits, 0 remote bytes pulled, 0 local disk writes.",
      },
      zh: {
        tab: "StrataBox 按需分页（热 L2）",
        summary:
          "所有工作集 256 KiB 数据块直接命中节点持久化 L2 缓存（336 次命中，0 远端块拉取），11 ms 内完成 16 路并发突发启动。",
        statNote: "336 次节点 L2 缓存命中，0 远端字节拉取，0 本地磁盘写入。",
      },
    },
  };

  const STORAGE_PILLARS = [
    {
      id: "erofs",
      en: {
        title: "Loop-free composable EROFS",
        body: "Mount immutable Base, Workspace, and Toolkit layers natively via file-backed Linux EROFS without consuming /dev/loop devices.",
        detail:
          "DashMap mount deduplication shares 3 read-only mounts across all concurrent containers; offline compaction merges base layers up to 3 GiB while preserving OverlayFS whiteouts.",
      },
      zh: {
        title: "零 Loop 原生可组合 EROFS",
        body: "直接利用 Linux 文件后端 EROFS 原生挂载不可变 Base、Workspace 与 Toolkit 层，零 /dev/loop 设备消耗。",
        detail:
          "通过 DashMap 引用计数让并发容器共享 3 个只读挂载实例；离线层合并支持 3 GiB 上限并完整保留 OverlayFS whiteout 语义。",
      },
    },
    {
      id: "fuse",
      en: {
        title: "Pure-Rust /dev/fuse 256 KiB pager",
        body: "Multi-device --blobdev images keep compact meta.erofs locally while fuse.stratabox intercepts kernel reads on demand in 256 KiB chunks.",
        detail:
          "Singleflight coalescing deduplicates concurrent misses into a persistent node-local L2 cache, keeping stat() and directory walks strictly local.",
      },
      zh: {
        title: "纯 Rust /dev/fuse 256 KiB 分页引擎",
        body: "多设备 --blobdev 镜像将轻量 meta.erofs 预取至本地，fuse.stratabox 以 256 KiB 粒度按需拦截内核读请求。",
        detail:
          "Singleflight 请求合并将并发缺页去重并落盘至节点持久化 L2 块缓存，确保 stat() 与目录遍历零远端往返。",
      },
    },
    {
      id: "cow",
      en: {
        title: "VM CoW blocks and scrubbed pack_diff",
        body: "OverlayBD-style 256 KiB copy-on-write block devices back MicroVm and FullVm guests with sparse dirty tracking and incremental snapshots.",
        detail:
          "pack_diff removes caller-specified sensitive paths and build-time UID artifacts before sealing a writable upperdir into a reusable read-only EROFS layer.",
      },
      zh: {
        title: "虚拟机 CoW 块引擎与脱敏 pack_diff",
        body: "OverlayBD 风格 256 KiB 写时复制虚拟块设备服务 MicroVm 与 FullVm，支持稀疏脏块追踪与免重打包增量快照。",
        detail:
          "pack_diff 在固化新只读 EROFS 层前强制清洗指定敏感路径与构建期 UID 残留，防止标准答案泄密。",
      },
    },
  ];

  const BENCHMARKS = {
    paging: {
      en: {
        tab: "On-demand paging (§8.2)",
        title: "16-sandbox burst latency across 4 images (7.81% working set)",
        unit: "ms (lower is better)",
        takeaway:
          "Local meta.erofs serves 128 stat() lookups with 0 remote data reads, cutting burst latency 2.93x cold and 30.36x warm while slashing cold disk writes by 98.6%.",
        headers: [
          "Provisioning mode",
          "Burst latency (ms)",
          "Speedup",
          "Remote pulled (MiB)",
          "Disk writes (MiB)",
          "L2 cache hits",
        ],
        rows: [
          ["Cold eager full pull (tar.gz)", "334", "1.00x", "79.59", "707.59", "0"],
          ["StrataBox 256 KiB EROFS (cold L2)", "114", "2.93x", "10.08 (-87.3%)", "10.08 (-98.6%)", "292"],
          ["StrataBox 256 KiB EROFS (warm L2)", "11", "30.36x", "0.00 (-100%)", "0.00 (-100%)", "336"],
        ],
      },
      zh: {
        tab: "按需分页 (§8.2)",
        title: "16 并发沙箱跨 4 镜像突发启动延迟（7.81% 读取工作集）",
        unit: "毫秒 ms（越低越好）",
        takeaway:
          "本地 meta.erofs 以 0 远端块读取承接 128 次 stat()，冷缓存突发加速 2.93 倍、热缓存加速 30.36 倍，本地磁盘写入削减 98.6%。",
        headers: [
          "供给模式",
          "突发延迟 (ms)",
          "加速比",
          "远端拉取 (MiB)",
          "本地写入 (MiB)",
          "L2 缓存命中",
        ],
        rows: [
          ["全量 tar.gz 拉取解压", "334", "1.00x", "79.59", "707.59", "0"],
          ["StrataBox 256 KiB EROFS（冷 L2）", "114", "2.93x", "10.08 (-87.3%)", "10.08 (-98.6%)", "292"],
          ["StrataBox 256 KiB EROFS（热 L2）", "11", "30.36x", "0.00 (-100%)", "0.00 (-100%)", "336"],
        ],
      },
      bars: [
        {
          labelEn: "Eager tar.gz unpack",
          labelZh: "全量 tar.gz 解压",
          value: 334,
          baseline: 334,
          accent: "#8A9BB5",
          valueText: "334 ms (1.00x)",
        },
        {
          labelEn: "StrataBox on-demand (cold L2)",
          labelZh: "StrataBox 按需分页（冷 L2）",
          value: 114,
          baseline: 334,
          accent: COLORS.top,
          valueText: "114 ms (2.93x)",
        },
        {
          labelEn: "StrataBox on-demand (warm L2)",
          labelZh: "StrataBox 按需分页（热 L2）",
          value: 11,
          baseline: 334,
          accent: COLORS.mid,
          valueText: "11 ms (30.36x)",
        },
      ],
    },
    layers: {
      en: {
        tab: "Composable layers (§8.3)",
        title: "12 concurrent SWE containers: EROFS layers vs. tar.gz unpack",
        unit: "MiB written / ms setup (lower is better)",
        takeaway:
          "All 12 containers share exactly 3 loop-free EROFS mounts (Base + Workspace + Toolkit), speeding up setup 6.21x and cutting disk writes 27.18x (53.19 vs. 1445.72 MiB).",
        headers: [
          "Strategy",
          "Setup (ms)",
          "Trace (ms)",
          "End-to-end (ms)",
          "Speedup",
          "Disk written (MiB)",
        ],
        rows: [
          ["Per-sandbox tar.gz extraction", "205", "90", "295", "1.00x", "1445.72"],
          ["StrataBox composable EROFS", "33 (6.21x)", "101", "134", "2.20x", "53.19 (27.18x lower)"],
        ],
      },
      zh: {
        tab: "可组合分层 (§8.3)",
        title: "12 并发 SWE 容器：EROFS 分层挂载 vs. 逐沙箱 tar.gz 解压",
        unit: "毫秒 ms / 写入量（越低越好）",
        takeaway:
          "全部 12 个并发容器共享 3 个无 loop 只读 EROFS 挂载，环境准备加速 6.21 倍，端到端加速 2.20 倍，本地磁盘写入降低 27.18 倍（53.19 vs. 1445.72 MiB）。",
        headers: [
          "供给策略",
          "环境准备 (ms)",
          "工具回放 (ms)",
          "端到端 (ms)",
          "总加速比",
          "磁盘写入 (MiB)",
        ],
        rows: [
          ["逐沙箱 tar.gz 解压", "205", "90", "295", "1.00x", "1445.72"],
          ["StrataBox 可组合 EROFS", "33 (6.21x)", "101", "134", "2.20x", "53.19（降 27.18 倍）"],
        ],
      },
      bars: [
        {
          labelEn: "tar.gz setup time",
          labelZh: "tar.gz 环境准备耗时",
          value: 205,
          baseline: 295,
          accent: "#8A9BB5",
          valueText: "205 ms",
        },
        {
          labelEn: "StrataBox EROFS setup time",
          labelZh: "StrataBox EROFS 准备耗时",
          value: 33,
          baseline: 295,
          accent: COLORS.mid,
          valueText: "33 ms (6.21x)",
        },
        {
          labelEn: "tar.gz end-to-end",
          labelZh: "tar.gz 端到端耗时",
          value: 295,
          baseline: 295,
          accent: "#64748B",
          valueText: "295 ms",
        },
        {
          labelEn: "StrataBox EROFS end-to-end",
          labelZh: "StrataBox EROFS 端到端耗时",
          value: 134,
          baseline: 295,
          accent: COLORS.bot,
          valueText: "134 ms (2.20x)",
        },
      ],
    },
    memory: {
      en: {
        tab: "Memory sharing (§8.4)",
        title: "Aggregate host PSS across 8 co-located sandboxes (32 MiB shared file)",
        unit: "MiB host PSS (lower is better)",
        takeaway:
          "Shared EROFS page-cache mapping reduces host PSS by 76.7% at N=8 (8.49 MiB/sandbox), while Container pause drops resident RAM from 41.62 to 2.07 MiB and Firecracker pause frees 100% of VMM RAM with 30 ms restore.",
        headers: [
          "Configuration / mechanism",
          "N or before",
          "Host PSS / after",
          "Per-sandbox / reclaimed",
          "Pause (ms)",
          "Auto-resume (ms)",
        ],
        rows: [
          ["Private per-sandbox file copy", "N = 8", "291.86 MiB", "36.48 MiB/sbx", "N/A", "N/A"],
          ["StrataBox shared EROFS lowerdir", "N = 1", "40.44 MiB", "40.44 MiB/sbx", "N/A", "N/A"],
          ["StrataBox shared EROFS lowerdir", "N = 4", "52.28 MiB", "13.07 MiB/sbx", "N/A", "N/A"],
          ["StrataBox shared EROFS lowerdir", "N = 8", "67.94 MiB (-76.7%)", "8.49 MiB/sbx", "N/A", "N/A"],
          ["Cold file-page eviction (mincore)", "64.00 MiB", "0.00 MiB", "100.0% evicted", "17", "N/A"],
          ["Container pause (cgroup.freeze)", "41.62 MiB", "2.07 MiB", "273.89 MiB advised", "34", "22"],
          ["Firecracker MicroVm pause (snapshot)", "256.00 MiB", "0.00 MiB", "100% host VMM RAM", "202", "30"],
        ],
      },
      zh: {
        tab: "内存共享与回收 (§8.4)",
        title: "8 个同机沙箱映射 32 MiB 共享文件时的宿主机聚合 PSS",
        unit: "MiB 宿主机 PSS（越低越好）",
        takeaway:
          "8 并发下共享 EROFS 页缓存使宿主机聚合 PSS 降低 76.7%（单沙箱仅 8.49 MiB）；容器暂停将驻留内存从 41.62 MiB 降至 2.07 MiB（22 ms 唤醒），Firecracker 暂停释放 100% VMM 内存（30 ms 恢复）。",
        headers: [
          "配置 / 回收机制",
          "并发数 / 暂停前",
          "聚合 PSS / 暂停后",
          "单沙箱 / 回收量",
          "暂停耗时 (ms)",
          "透明唤醒 (ms)",
        ],
        rows: [
          ["私有逐沙箱副本（基线）", "N = 8", "291.86 MiB", "36.48 MiB/沙箱", "N/A", "N/A"],
          ["StrataBox 共享 EROFS 只读层", "N = 1", "40.44 MiB", "40.44 MiB/沙箱", "N/A", "N/A"],
          ["StrataBox 共享 EROFS 只读层", "N = 4", "52.28 MiB", "13.07 MiB/沙箱", "N/A", "N/A"],
          ["StrataBox 共享 EROFS 只读层", "N = 8", "67.94 MiB (-76.7%)", "8.49 MiB/沙箱", "N/A", "N/A"],
          ["冷文件页驱逐 (mincore)", "64.00 MiB", "0.00 MiB", "100.0% 驱逐", "17", "N/A"],
          ["Container pause (cgroup.freeze)", "41.62 MiB", "2.07 MiB", "273.89 MiB 扫描换出", "34", "22"],
          ["Firecracker MicroVm 快照暂停", "256.00 MiB", "0.00 MiB", "释放 100% VMM 内存", "202", "30"],
        ],
      },
      bars: [
        {
          labelEn: "Private copies (N=8)",
          labelZh: "私有副本（N=8）",
          value: 291.86,
          baseline: 291.86,
          accent: "#8A9BB5",
          valueText: "291.86 MiB",
        },
        {
          labelEn: "Shared EROFS (N=8)",
          labelZh: "共享 EROFS（N=8）",
          value: 67.94,
          baseline: 291.86,
          accent: COLORS.mid,
          valueText: "67.94 MiB (-76.7%)",
        },
        {
          labelEn: "Shared EROFS (N=4)",
          labelZh: "共享 EROFS（N=4）",
          value: 52.28,
          baseline: 291.86,
          accent: COLORS.bot,
          valueText: "52.28 MiB (13.07/sbx)",
        },
        {
          labelEn: "Shared EROFS (N=1)",
          labelZh: "共享 EROFS（N=1）",
          value: 40.44,
          baseline: 291.86,
          accent: COLORS.top,
          valueText: "40.44 MiB",
        },
      ],
    },
    qos: {
      en: {
        tab: "CPU QoS (§8.5)",
        title: "Latency-sensitive (LS) p50/p99 step latency under 50% BE SMT stress",
        unit: "ms step latency (lower is better; solo p50 = 13.07 ms)",
        takeaway:
          "SCHED_IDLE alone still suffers +54.5% p50 inflation from sibling SMT cache and ALU contention. Adding Linux PR_SCHED_CORE expels BE sibling threads, bounding 50% load p50 to 15.29 ms (+17.0%) and p99 to 15.61 ms (vs. 42.06 ms unprotected).",
        headers: [
          "BE load",
          "BE threads",
          "Unprotected p50/p99 (ms)",
          "SCHED_IDLE p50/p99 (ms)",
          "SCHED_IDLE + PR_SCHED_CORE",
          "CoreSched inflation",
        ],
        rows: [
          ["10%", "1", "14.57 / 20.68 (+11.5%)", "13.32 / 20.89 (+1.9%)", "13.65 / 15.55", "+4.4%"],
          ["30%", "3", "20.80 / 22.06 (+59.2%)", "19.21 / 20.79 (+47.0%)", "13.80 / 15.42", "+5.6%"],
          ["50%", "4", "21.68 / 42.06 (+65.9%)", "20.19 / 20.71 (+54.5%)", "15.29 / 15.61", "+17.0%"],
        ],
      },
      zh: {
        tab: "双层 CPU QoS (§8.5)",
        title: "50% BE 超线程压力下延迟敏感型（LS）任务步延迟（独享基线 13.07 ms）",
        unit: "毫秒 ms（越低越好）",
        takeaway:
          "仅靠 SCHED_IDLE 仍会因同物理核超线程竞争 L1/L2 缓存导致 +54.5% 中位膨胀；叠加 Linux PR_SCHED_CORE 驱逐同核 BE 线程后，50% 负载下 p50 锁定在 15.29 ms（+17.0%），p99 从 42.06 ms 降至 15.61 ms。",
        headers: [
          "BE 负载",
          "BE 线程数",
          "无保护 p50/p99 (ms)",
          "仅 SCHED_IDLE (ms)",
          "SCHED_IDLE + PR_SCHED_CORE",
          "核调度膨胀率",
        ],
        rows: [
          ["10%", "1", "14.57 / 20.68 (+11.5%)", "13.32 / 20.89 (+1.9%)", "13.65 / 15.55", "+4.4%"],
          ["30%", "3", "20.80 / 22.06 (+59.2%)", "19.21 / 20.79 (+47.0%)", "13.80 / 15.42", "+5.6%"],
          ["50%", "4", "21.68 / 42.06 (+65.9%)", "20.19 / 20.71 (+54.5%)", "15.29 / 15.61", "+17.0%"],
        ],
      },
      bars: [
        {
          labelEn: "Unprotected p99 (50% BE)",
          labelZh: "无保护 p99（50% BE）",
          value: 42.06,
          baseline: 42.06,
          accent: "#C25450",
          valueText: "42.06 ms p99",
        },
        {
          labelEn: "Unprotected p50 (50% BE)",
          labelZh: "无保护 p50（50% BE）",
          value: 21.68,
          baseline: 42.06,
          accent: "#8A9BB5",
          valueText: "21.68 ms (+65.9%)",
        },
        {
          labelEn: "SCHED_IDLE only p50",
          labelZh: "仅 SCHED_IDLE p50",
          value: 20.19,
          baseline: 42.06,
          accent: COLORS.top,
          valueText: "20.19 ms (+54.5%)",
        },
        {
          labelEn: "CoreSched p50 / p99",
          labelZh: "CoreSched p50 / p99",
          value: 15.29,
          baseline: 42.06,
          accent: COLORS.mid,
          valueText: "15.29 / 15.61 ms (+17.0%)",
        },
        {
          labelEn: "Solo LS baseline p50",
          labelZh: "独享 LS 基线 p50",
          value: 13.07,
          baseline: 42.06,
          accent: COLORS.bot,
          valueText: "13.07 ms",
        },
      ],
    },
  };

  const SECURITY_LAYERS = [
    {
      id: "ebpf",
      en: {
        name: "Live-reloaded cgroup v2 eBPF and nftables firewall",
        threat:
          "Agents port-scan internal package mirrors or fetch ground-truth solutions from PyPI, NPM, or GitHub once evaluation begins.",
        defense:
          "Attaches native 64-bit cgroup v2 connect4 and udp4_sendmsg eBPF programs alongside atomic per-netns nftables (stratabox_fw) rulesets, transitioning egress allowlists in sub-millisecond time via update_network_rules.",
        kernelRef: "bpf(2) BPF_CGROUP_INET4_CONNECT / UDP4_SENDMSG + nftables",
      },
      zh: {
        name: "热更新 cgroup v2 eBPF 与 nftables 双层防火墙",
        threat:
          "智能体扫描内网镜像源，或在进入评测阶段后通过 PyPI、NPM 或 GitHub 拉取外部参考答案。",
        defense:
          "直接通过 bpf(2) 挂载 64 位 cgroup v2 connect4 与 udp4_sendmsg eBPF 字节码，配合每网络命名空间 nftables（stratabox_fw）规则集原子替换，支持 update_network_rules 毫秒级切换外网白名单。",
        kernelRef: "bpf(2) BPF_CGROUP_INET4_CONNECT / UDP4_SENDMSG + nftables",
      },
    },
    {
      id: "mac",
      en: {
        name: "AppArmor and Landlock ABI v8 confinement",
        threat:
          "Untrusted root agents overwrite /bin/bash or tamper with internal runtime binaries to hijack subsequent grading commands.",
        defense:
          "Enforces the stratabox-sandbox AppArmor profile plus Landlock ABI v8 filesystem, abstract socket, and signal scoping, while keeping /.stratabox/bin/stratabox-agent on a protected read-only mount.",
        kernelRef: "AppArmor (stratabox-sandbox) + Landlock ABI v8 + read-only mount",
      },
      zh: {
        name: "AppArmor 与 Landlock ABI v8 强制访问控制",
        threat:
          "沙箱内拥有 root 权限的模型篡改 /bin/bash 或运行时二进制，试图劫持后续评测判题脚本。",
        defense:
          "叠加 stratabox-sandbox AppArmor 配置集与 Landlock ABI v8（最小化文件系统、抽象域 Unix Socket 与信号作用域权限），并将 /.stratabox/bin/stratabox-agent 锁定在受保护只读挂载点。",
        kernelRef: "AppArmor (stratabox-sandbox) + Landlock ABI v8 + 只读保护挂载",
      },
    },
    {
      id: "seccomp",
      en: {
        name: "Seccomp-BPF ioctl and escape syscall filter",
        threat:
          "Agents invoke destructive filesystem ioctls like XFS_IOC_SWAPEXT (0x586d), raw mknod, or mount/bpf syscalls to bypass ACLs or corrupt host metadata.",
        defense:
          "Applies a strict Seccomp-BPF filter returning EPERM on XFS_IOC_SWAPEXT, mount, umount2, pivot_root, unshare, bpf, kexec_load, and pidfd_getfd while dropping CAP_SYS_ADMIN and CAP_MKNOD.",
        kernelRef: "Seccomp-BPF (0x586d, mount, bpf, pidfd_getfd) + cap drop",
      },
      zh: {
        name: "Seccomp-BPF 破坏性 ioctl 与逃逸调用拦截",
        threat:
          "智能体调用 XFS_IOC_SWAPEXT（0x586d）、原始设备节点创建或 mount/bpf 等高危系统调用绕过权限控制或破坏文件系统。",
        defense:
          "加载精确 Seccomp-BPF 策略，对 XFS_IOC_SWAPEXT、mount、umount2、pivot_root、unshare、bpf、kexec_load 与 pidfd_getfd 统一返回 EPERM，并剥离 CAP_SYS_ADMIN 与 CAP_MKNOD。",
        kernelRef: "Seccomp-BPF (0x586d, mount, bpf, pidfd_getfd) + 权能剥离",
      },
    },
    {
      id: "uds",
      en: {
        name: "Pre-pivot_root hidden control sockets and FD isolation",
        threat:
          "Root processes scan the filesystem or /proc/net/unix to locate aether or chronus sockets, read internal logs, and forge control RPCs.",
        defense:
          "Binds aether's listening socket on the host filesystem before pivot_root (inherited via --listen-fd 3) and uses FD_CLOEXEC anonymous socketpairs between aether and chronus so zero control paths exist inside the sandbox.",
        kernelRef: "pivot_root + inherited --listen-fd 3 + FD_CLOEXEC socketpair",
      },
      zh: {
        name: "pivot_root 前置隐藏控制套接字与 FD 隔离",
        threat:
          "沙箱内 root 进程扫描文件系统与 /proc/net/unix，探测 aether/chronus 套接字与日志以伪造控制 RPC。",
        defense:
          "在 pivot_root 之前于宿主机侧预绑定控制套接字并通过 --listen-fd 3 继承传递，aether 与 chronus 间采用带 FD_CLOEXEC 的匿名 socketpair，沙箱视野内零控制路径与日志暴露。",
        kernelRef: "pivot_root + 继承 --listen-fd 3 + FD_CLOEXEC socketpair",
      },
    },
    {
      id: "proc",
      en: {
        name: "Masked /proc, bounded stdout, and fork-bomb containment",
        threat:
          "Recursive grep / reads /proc/kpagecgroup or /proc/kcore triggering host kernel bugs, while yes floods or fork bombs exhaust node storage and PIDs.",
        defense:
          "Masks /proc/kpagecgroup, /proc/kcore, /proc/kallsyms, /proc/sysrq-trigger, and /sys/firmware; caps chronus stdout capture with truncated=true; enforces cgroup v2 pids.max and atomic cgroup.kill=1 teardown.",
        kernelRef: "Masked /proc & /sys + cgroup v2 pids.max / cgroup.kill",
      },
      zh: {
        name: "/proc 高危遮蔽、输出截断与 Fork 炸弹围栏",
        threat:
          "递归 grep / 遍历 /proc/kpagecgroup 或 /proc/kcore 诱发内核异常，或执行 yes 刷屏与 Fork 炸弹打满宿主机磁盘与进程表。",
        defense:
          "遮蔽 /proc/kpagecgroup、/proc/kcore、/proc/kallsyms、/proc/sysrq-trigger 与 /sys/firmware；chronus 强制输出上限并标记 truncated=true；通过 cgroup v2 pids.max 限流与 cgroup.kill=1 原子清剿。",
        kernelRef: "/proc 与 /sys 遮蔽 + cgroup v2 pids.max / cgroup.kill",
      },
    },
    {
      id: "packdiff",
      en: {
        name: "Scrubbed pack_diff environment snapshotting",
        threat:
          "Agent-built environments leak reference patches, shell history, or build-time credentials in residual upperdir files during subsequent evaluations.",
        defense:
          "pack_diff stages the writable upperdir, strips caller-specified scrub_paths and builder-UID residual artifacts, and seals the cleaned diff into a verifiable read-only EROFS layer.",
        kernelRef: "mkfs.erofs --ovlfs-strip=0 + scrub_paths / builder UID filter",
      },
      zh: {
        name: "防泄密脱敏 pack_diff 环境快照固化",
        threat:
          "环境构建阶段残留的标准补丁、Shell 历史或临时密钥留在可写层中，在后续评测 Rollout 时被模型读取作弊。",
        defense:
          "pack_diff 在打包沙箱可写层前强制清洗调用方指定的 scrub_paths 与构建期 UID 残留文件，随后封装为不可变只读 EROFS 工作区层供集群复用。",
        kernelRef: "mkfs.erofs --ovlfs-strip=0 + scrub_paths / 构建期 UID 清洗",
      },
    },
  ];

  const ROUTING_PRESETS = [
    {
      id: "stratabox-edge01-fn-7a91c0",
      backend: "fncall",
      en: "Warm FnCall worker on edge01",
      zh: "edge01 节点上的 FnCall 预热工作槽",
    },
    {
      id: "stratabox-edge02-ctr-9f4a21",
      backend: "container",
      en: "Stateful SWE Container on edge02",
      zh: "edge02 节点上的有状态 SWE 容器",
    },
    {
      id: "stratabox-edge03-uvm-4d8e12",
      backend: "microvm",
      en: "Firecracker MicroVm on edge03",
      zh: "edge03 节点上的 Firecracker 微虚拟机",
    },
    {
      id: "stratabox-edge04-vm-2c6b08",
      backend: "fullvm",
      en: "QEMU/KVM FullVm on edge04",
      zh: "edge04 节点上的 QEMU/KVM 完整虚拟机",
    },
  ];

  const QUICKSTART = {
    install: {
      lang: "bash",
      code: `# 1. Build release binaries (in-sandbox agent and cluster/node CLI)
cargo build --locked --release -p stratabox-agent -p stratabox-daemon

# 2. (Optional) Build a 100% static zero-glibc musl stratabox-agent for Alpine / FROM scratch
CC_x86_64_unknown_linux_musl=gcc cargo build --locked --release \\
  --target x86_64-unknown-linux-musl -p stratabox-agent

# 3. Install the unified async Python SDK (stratabox)
pip install "git+https://github.com/stratabox/stratabox-sdk-python.git"`,
      en: {
        tab: "1. Build and install",
        summary:
          "Compile stratabox-agent and stratabox-daemon in release mode, optionally build the static musl guest agent, and install stratabox.",
      },
      zh: {
        tab: "1. 编译与安装",
        summary:
          "编译发布版 stratabox-agent 与 stratabox-daemon，可选构建全静态 musl 沙箱代理，并安装 stratabox 异步 SDK。",
      },
    },
    cluster: {
      lang: "bash",
      code: `# Launch a complete local cluster (ControlPlane + 2 real Edge nodes + tight capacity edge)
./target/release/stratabox-daemon cluster \\
  --listen 127.0.0.1:18080 \\
  --edges 2 \\
  --include-tight-edge

# Or start standalone multi-process Edge and stateless ControlPlane nodes:
./target/release/stratabox-daemon edge \\
  --edge-id edge-01 --listen 127.0.0.1:19001 --shared-3fs-dir /var/tmp/stratabox-shared

./target/release/stratabox-daemon control \\
  --listen 127.0.0.1:18080 --seed-edge http://127.0.0.1:19001`,
      en: {
        tab: "2. Start cluster",
        summary:
          "Bootstrap a default base:default EROFS image on the fly and launch a local multi-edge cluster or independent daemons.",
      },
      zh: {
        tab: "2. 启动集群",
        summary:
          "一键引导构建默认 base:default 只读 EROFS 镜像，并启动本地多节点集群或独立控制面与计算节点进程。",
      },
    },
    oci: {
      lang: "bash",
      code: `# Convert a local Docker image (or OCI layout / tar.gz / tar.zst) into 256 KiB chunked EROFS
./target/release/stratabox-daemon layer import-oci \\
  --source docker:python:3.12-slim \\
  --output-dir /var/tmp/stratabox-layers/python312 \\
  --layer-id base/python:3.12-slim \\
  --multi-device

# Compile a local toolkit or workspace directory into an immutable 256 KiB chunked EROFS layer
./target/release/stratabox-daemon layer build \\
  --source ./my-toolkit-dir \\
  --output /var/tmp/stratabox-layers/my-toolkit.erofs \\
  --blobdev /var/tmp/stratabox-layers/my-toolkit.blob \\
  --chunk-size 262144`,
      en: {
        tab: "3. Import OCI layers",
        summary:
          "Convert Docker or OCI images offline into multi-device meta.erofs + data.blob artifacts and compile custom toolkit layers.",
      },
      zh: {
        tab: "3. 导入 OCI 分层",
        summary:
          "离线将 Docker 或 OCI 镜像转换为多设备 meta.erofs + data.blob 制品，并将自定义工作区与工具链编译为只读 EROFS 层。",
      },
    },
    sdk: {
      lang: "python",
      code: `import asyncio
from stratabox import StrataBoxClient, StrataBoxContainerRunArgs, StrataBoxFnCallArgs

async def main() -> None:
    async with StrataBoxClient("http://127.0.0.1:18080", token="stratabox-root-token") as client:
        fn = await client.run_fncall(
            StrataBoxFnCallArgs(language="python", code="print(6 * 7)", use_warm_python=True)
        )
        print(f"FnCall stdout={fn.stdout.strip()} warm_hit={fn.warm_hit}")

        ctr_args = StrataBoxContainerRunArgs(
            container_image="base:default",
            memory_limit_mb=1024,
            cpu_cores_limit=2,
            qos_class="LS",
            network_rules={"pypi": True, "npm": False},
        )
        async with await client.run_container_group(ctr_args, count=8, concurrency=8) as group:
            await group.pause_all()
            await group.resume_all()

asyncio.run(main())`,
      en: {
        tab: "4. Run Python SDK",
        summary:
          "Invoke warm FnCall workers, provision core-scheduled containers, and coordinate batch RL rollout groups with automatic rollback.",
      },
      zh: {
        tab: "4. 运行 Python SDK",
        summary:
          "调用预热 FnCall 通道、启动核调度容器，并使用 SandboxGroup 并发编排强化学习批量沙箱组。",
      },
    },
  };

  const CRATES = [
    {
      name: "stratabox-proto",
      path: "crates/stratabox-proto",
      en: {
        summary:
          "Shared wire DTOs, typed error catalog, zero-alloc SandboxId codec, length-prefixed binary RPC framing, and core async traits.",
      },
      zh: {
        summary:
          "共享线缆 DTO、错误码体系、零分配 SandboxId 编解码器、二进制长度前缀 RPC 帧协议与核心异步 Trait。",
      },
    },
    {
      name: "stratabox-agent",
      path: "crates/stratabox-agent",
      en: {
        summary:
          "Static musl in-sandbox daemon housing the aether UDS/AF_VSOCK multiplexer, chronus stateful session workers, and built-in POSIX sh fallback.",
      },
      zh: {
        summary:
          "全静态 musl 沙箱内代理，集成 aether 多路复用器、chronus 每会话有状态工作进程及零依赖 POSIX sh 兜底。",
      },
    },
    {
      name: "stratabox-storage",
      path: "crates/stratabox-storage",
      en: {
        summary:
          "Loop-free EROFS/OverlayFS composition, pure-Rust /dev/fuse (fuse.stratabox) 256 KiB pager with L2 cache, VM CoW blocks, compaction, and pack_diff.",
      },
      zh: {
        summary:
          "无 loop 原生 EROFS/OverlayFS 分层组合、纯 Rust /dev/fuse 256 KiB 按需分页与 L2 缓存、虚拟机 CoW 块引擎及脱敏 pack_diff。",
      },
    },
    {
      name: "stratabox-sandbox",
      path: "crates/stratabox-sandbox",
      en: {
        summary:
          "Four execution backends (fncall, container, firecracker, vm), cgroup v2 freeze/reclaim, bpf(2) eBPF + nftables firewall, MAC/Seccomp, and PR_SCHED_CORE.",
      },
      zh: {
        summary:
          "四大执行后端（fncall、container、firecracker、vm）、cgroup v2 冻结回收、原生 eBPF + nftables 防火墙、MAC/Seccomp 与核调度。",
      },
    },
    {
      name: "stratabox-edge",
      path: "crates/stratabox-edge",
      en: {
        summary:
          "Node daemon enforcing RAII atomic admission (503 RESOURCE_EXHAUSTED), transparent PAUSED auto-resume, idempotent command replay, and TTL reaping.",
      },
      zh: {
        summary:
          "节点守护进程：RAII 原子准入控制（超载返回 503）、PAUSED 透明唤醒、幂等命令重放缓存与双阈值 TTL 回收器。",
      },
    },
    {
      name: "stratabox-control",
      path: "crates/stratabox-control",
      en: {
        summary:
          "Stateless cluster control plane combining nested project IAM, heartbeat Watcher, Power-of-k PlacementEngine with in-flight overlay, and O(1) ApiServer.",
      },
      zh: {
        summary:
          "无状态集群控制面：多级嵌套项目 IAM、心跳聚合 Watcher、Power-of-k 调度器与 O(1) 零状态 ApiServer。",
      },
    },
    {
      name: "stratabox-daemon",
      path: "crates/stratabox-daemon",
      en: {
        summary:
          "Composition root and unified CLI (cluster, control, edge, layer, bench), offline OCI/Docker importer, and the full §8 empirical benchmark suite.",
      },
      zh: {
        summary:
          "顶层组装根与统一 CLI（cluster、control、edge、layer、bench）、离线 OCI 导入器与论文 §8 定量基准测试套件。",
      },
    },
    {
      name: "stratabox",
      path: "stratabox/stratabox-sdk-python",
      en: {
        summary:
          "Unified async and sync Python SDK covering all four backends, SandboxGroup batch rollouts, 429/503 jittered backoff, streaming, PauseResult, and pack_diff.",
      },
      zh: {
        summary:
          "统一异步/同步 Python SDK，覆盖四大后端、SandboxGroup 批量编排、429/503 抖动退避重试、流式执行、PauseResult 与 pack_diff。",
      },
    },
  ];

  const BIBTEX = `@techreport{huang2026dsec,
  title       = {DeepSeek Elastic Compute (DSec): A Sandbox Infrastructure for Effective Agentic Training at Scale},
  author      = {Huang, Jialiang and Tang, Hongxuan and Chen, Jingchang and Liu, Yuxuan and Chen, Yixiao and Cheng, Yuan and Tao, Yi and Zhou, Jingli and Chen, Yupeng and Chen, Haoyu and others},
  institution = {DeepSeek-AI and Tsinghua University},
  year        = {2026},
  number      = {arXiv:2609.22978},
  url         = {https://arxiv.org/abs/2609.22978}
}`;

  window.STRATABOX_DATA = {
    colors: COLORS,
    i18n: I18N,
    ui: UI,
    strataboxLayers: STRATABOX_LAYERS,
    backends: BACKENDS,
    backendMatrix: BACKEND_MATRIX,
    pagingModes: PAGING_MODES,
    storagePillars: STORAGE_PILLARS,
    benchmarks: BENCHMARKS,
    securityLayers: SECURITY_LAYERS,
    routingPresets: ROUTING_PRESETS,
    quickstart: QUICKSTART,
    crates: CRATES,
    bibtex: BIBTEX,
  };
})();
