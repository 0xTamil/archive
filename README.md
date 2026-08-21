# Awesome Low Level

## Roadmap

If you are new to low-level programming, follow these core steps:

1. **Learn Computer Fundamentals**
   * **What to do:** Understand how computers read data and execute instructions. Learn basic programming rules like variables, loops, logic, and how your code actually talks to hardware components like the CPU and RAM.
   * **Why it matters:** Building a strong mental model of how computer memory and hardware work together makes learning any system language much easier later on.

2. **Learn C & Memory**
   * **What to do:** Learn the **C programming language** deeply. Focus on core low-level topics: managing memory manually, using pointers (variables that store memory addresses), doing pointer arithmetic, and allocation (`malloc` and `free`).
   * **Why it matters:** C is the foundational language of systems programming. It strips away hidden abstractions and gives you direct control over memory, forcing you to understand exactly how software interacts with computer hardware.

3. **Build Small Projects**
   * **What to do:** Put your C knowledge to work by building tiny, practical command-line interface (CLI) tools. Build things like a custom file reader, a simple memory-logging tool, a text file parser, or a basic shell utility.
   * **Why it matters:** Writing code from scratch is the fastest way to catch memory leaks, fix pointer bugs, and learn how real programs interact with the operating system.

4. **Study Algorithms & Data Structures**
   * **What to do:** Learn standard ways to organize data (like linked lists, arrays, stacks, queues, and trees) and key techniques to process that data (like sorting, searching, and recursion).
   * **Why it matters:** Hardware has limits. Choosing the right data structure and algorithm ensures your low-level code runs fast, uses minimal RAM, and handles big workloads cleanly.

5. **Pick a Specialized Field**
   * **What to do:** Decide what kind of low-level software you want to build. Pick one focused domain to explore next.
   * **Why it matters:** Low-level programming is a massive field. Picking a specific path gives you a clear target and helps you choose the exact tools and projects to build next.

6. **Learn Modern Systems Languages (Optional)**
   * **What to do:** Expand your skills beyond C by exploring modern systems programming languages like **C++, Rust, Zig, or Odin** or choose to **stick with C**, as it remains fully powerful and relevant for almost all low-level domains.
   * **Why it matters:** While C is all you strictly need, learning modern languages introduces extra toolsets like object-oriented design in C++, automatic memory safety in Rust, or streamlined syntax and memory control in Zig and Odin.

---

## Getting Started
- **[The Hidden Language of Computer Hardware and Software](https://charlespetzold.com/code/)**
- **[Exploring How Computers Work](https://www.youtube.com/watch?v=QZwneRb-zqA)**
- **[A Crash Course in Computer Science](https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo)**
- **[CS50: Introduction to Computer Science](https://pll.harvard.edu/course/cs50-introduction-computer-science)**
- **[Teach Yourself CS](https://teachyourselfcs.com/)**
- **[Beej's Guide to Learning Computer Science](https://beej.us/guide/bglcs/)**
- **[Open Source Society University (OSSU)](https://github.com/ossu/computer-science)**

---

## Core Foundations

### C Programming
- **[Beej's Guide to C Programming](https://beej.us/guide/bgc/)**: A clear guide to practical C development and the standard library.
- **[C Programming: A Modern Approach](https://knking.com/books/c2/)**: A detailed textbook widely considered the best standard reference for C beginners.
- **[The C Book](http://knking.com/books/c2/index.html)**: A free reference book covering foundational C concepts.
- **[The C Programming Language (K&R)](https://en.wikipedia.org/wiki/The_C_Programming_Language)**: The original, concise introduction to C written by its creators.
- **[Learn C](https://learn-c.org/)**: Interactive browser-based tutorials for writing and testing C code.
- **[C FAQ](https://c-faq.com/)**: Practical answers to common questions, tricky bugs, and pointer memory rules.
- **[C Interfaces and Implementations](https://github.com/drh/cii)**: Learn how to design modular and reusable C libraries.

### Data Structures & Algorithms
- **[Data Structures and Algorithms Tutorial](https://www.w3schools.com/dsa/index.php)**: A beginner-friendly guide to organizing and processing data.
- **[VisuAlgo](https://visualgo.net/)**: Animated visual tools showing how algorithms sort and search data.
- **[MIT 6.006: Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)**: Free university lectures covering algorithmic design and efficiency.
- **[Algorithm Visualizer](https://algorithm-visualizer.org/)**: An interactive platform that animates actual code execution step-by-step.
- **[Algorithms (Sedgewick & Wayne)](https://algs4.cs.princeton.edu/home/)**: A detailed textbook covering classic algorithms and data structures.

---

## Other Systems Languages (Optional)

### C++ Programming
- **[How to Start C++ Development?](https://github.com/W4RH4WK/cpp-init)**: A practical guide to setting up compilers, build systems, and environments.
- **[Learn C++](https://www.learncpp.com)**: Comprehensive step-by-step tutorials covering beginner to advanced C++.
- **[Hacking C++](https://hackingcpp.com/index.html)**: Visual diagrams and cheat sheets for modern C++ standards.
- **[C++ By Example](https://cppbyexample.com/)**: Concise code snippets demonstrating modern C++ syntax and features.
- **[C++ Reference](https://en.cppreference.com/w/)**: The official standard dictionary for all C++ keywords and standard library modules.
- **[Modern C++ Features](https://github.com/AnthonyCalandra/modern-cpp-features)**: A practical summary of features added in C++11 and newer versions.
- **[C++ Programming Exercises](https://www.w3resource.com/cpp-exercises/)**: Coding challenges with worked solutions to test your understanding.
- **[Project Euler](https://projecteuler.net/about)**: Logic and mathematics problems designed to be solved with code.
- **[Cpp Quiz](https://cppquiz.org/)**: Multiple-choice quizzes testing your knowledge of exact C++ language rules.
- **[Data-Oriented Design Resources](https://github.com/dbartolini/data-oriented-design)**: Resources on structuring memory layout for maximum CPU performance.
- **[Bit Twiddling Hacks](https://graphics.stanford.edu/~seander/bithacks.html)**: A famous collection of fast bitwise math operations and low-level tricks.

### Rust
- **[The Rust Programming Language](https://doc.rust-lang.org/book/)**: The official book covering memory safety, ownership, and concurrency.
- **[Rustlings](https://github.com/rust-lang/rustlings)**: Small hands-on programming exercises to practice Rust syntax.
- **[Rust by Example](https://doc.rust-lang.org/rust-by-example/)**: Runnable code examples demonstrating how Rust features work.
- **[Too Many Linked Lists](https://rust-unofficial.github.io/too-many-lists/)**: Learn advanced memory handling in Rust by building list structures.
- **[The Rustonomicon](https://doc.rust-lang.org/nomicon/)**: An advanced guide to writing unsafe Rust and raw memory operations.
- **[Awesome Rust](https://github.com/rust-unofficial/awesome-rust)**: A curated list of popular Rust libraries, frameworks, and tools.

### Zig
- **[Zig Learn](https://ziglearn.org/)**: A structured step-by-step guide to Zig syntax and manual memory control.
- **[Zig Language Reference](https://ziglang.org/documentation/master/)**: The official specification covering Zig tools and language features.
- **[Ziglings](https://codeberg.org/ziglings/exercises)**: Interactive broken-code exercises designed to teach you Zig syntax.
- **[Learning Zig](https://pedropark99.github.io/zig-book/)**: A clear guide explaining low-level systems concepts using Zig.
- **[Awesome Zig](https://github.com/zigcc/awesome-zig)**: A community repository of useful tools, engines, and starter projects.

### Odin
- **[Odin Overview](https://odin-lang.org/docs/overview/)**: A fast overview of Odin's syntax, design goals, and memory control.
- **[Odin Demo Program](https://github.com/odin-lang/Odin/blob/master/examples/demo/demo.odin)**: A single code file demonstrating almost every feature in Odin.
- **[Understanding the Odin Programming Language](https://odinbook.com/)**: A free introductory book on developing systems with Odin.
- **[Learn Odin in Y Minutes](https://learnxinyminutes.com/odin/)**: A concise syntax cheat sheet for quick reference.
- **[Awesome Odin](https://github.com/jakubtomsu/awesome-odin)**: A collection of game engines, libraries, and resources built with Odin.

---

## Specialized Fields

### 1. Embedded Systems
> **Overview:**  
> Embedded programming means writing code that runs on tiny microcontrollers, sensors, and chips inside physical devices instead of standard PCs. You work directly with hardware interfaces to control microcontrollers inside things like smart appliances, cars, and medical devices.

- **[Awesome Embedded](https://github.com/nhivp/Awesome-Embedded)**: Resources for bare-metal programming, microcontrollers, and low-level firmware.
- **[Awesome Embedded Linux](https://github.com/fkromer/awesome-embedded-linux)**: Tools and guides for running custom Linux systems on small hardware chips.

---

### 2. FPGA Programming
> **Overview:**  
> FPGA programming means designing custom hardware circuits instead of writing normal software. Instead of giving steps to a CPU, you reconfigure physical chips to process massive amounts of data at the exact same time. It is used when normal processors are too slow, like in high-speed stock trading, defense hardware, and microchip design.

- **[Awesome FPGA](https://github.com/Vitorian/awesome-fpga)**: A curated list of hardware development resources, FPGA tools, HDLs, and project tutorials.
- **[Awesome FPGA Programming](https://github.com/emanueledelsozzo/awesome-fpga-programming)**: Guides, toolchains, and learning materials for developing and compiling custom logic circuits.

---

### 3. Compilers & Interpreters
> **Overview:**  
> Compiler development means building tools that read high-level code (like C, Rust, or Python) and turn it into binary code that computer hardware actually understands. You learn how programming languages process text, optimize performance, and turn instructions into CPU operations.

- **[Awesome Compilers](https://github.com/aalhour/awesome-compilers)**: A collection of books, courses, frameworks, and projects for building compilers and runtime engines.

---

### 4. Operating Systems Development
> **Overview:**  
> OS development means building system software like Linux or Windows from zero. You write code that talks directly to the hardware to manage computer memory, control processor tasks, build file systems, and write drivers for keyboards, screens, and hard drives.

- **[Awesome OS Dev](https://github.com/devse-org/awesome-osdev)**: Specifications, technical tutorials, and project repositories for building custom operating systems.

---

### 5. GPGPU & Parallel Computing
> **Overview:**  
> GPGPU means using graphics card hardware to handle massive mathematical problems instead of just rendering visuals. Because GPUs have thousands of small cores, you write code that runs thousands of calculations at once for artificial intelligence, 3D math, and heavy data science.

- **[Awesome GPGPU](https://github.com/jslee02/awesome-gpgpu)**: Frameworks, technical guides, and libraries for general-purpose parallel computing on GPUs.
- **[Awesome GPU](https://github.com/Jokeren/Awesome-GPU)**: A detailed collection of resources on GPU hardware architecture and parallel optimization.

---

### 6. Graphics Programming
> **Overview:**  
> Graphics programming means writing code that tells the graphics card how to draw 2D and 3D scenes on screen. You work with math, lighting models, texture shaders, and graphics software interfaces (like Vulkan or DirectX) to build real-time visual software.

- **[Awesome Graphics Programming](https://gist.github.com/notnotrobby/ceef71527b4f15869133ba7b397912e9)**: Curated math tutorials, rendering guides, and engine development links.

---

### 7. Game Engine Development
> **Overview:**  
> Game engine development means building the underlying tool (like Unreal or Unity) that games run on. Instead of making a game directly, you write the low-level systems for 3D graphics, collision physics, sound, controller input, and file loading. It is all about squeezing every bit of speed out of the computer so games run smoothly without lagging.

- **[Awesome Game Engine Dev](https://github.com/stevinz/awesome-game-engine-dev)**: A curated collection of books, tutorials, libraries, and resources for building custom game engines from scratch.
- **[Awesome Game Engines](https://github.com/ChessMax/awesome-game-engines)**: An organized directory of open-source game engines, architecture designs, and reference implementations to study.

---

### 8. Network System Programming
> **Overview:**  
> Network systems programming involves writing software that sends raw data packets across networks at maximum speed. You work directly with network sockets, protocol stacks (TCP/UDP, HTTP), asynchronous IO, and custom packet processing. It is key for building high-performance web servers, routing software, and multiplayer game servers.

- **[Awesome Networking](https://github.com/facyber/awesome-networking)**: A beginner-friendly collection of books, courses, protocols, and tutorials for learning general computer networking concepts.
- **[Awesome Computer Networking](https://github.com/nyquist/awesome-networking)**: A detailed list of resources for designing, operating, and monitoring enterprise network systems.
- **[Awesome Network Programmability](https://github.com/cisco-ie/awesome-network-programmability)**: A collection of libraries, and guides focused on automating network devices and writing network software.
- **[Awesome Game Networking](https://github.com/rumaniel/Awesome-Game-Networking)**: A curated list of resources, libraries, and articles for building multiplayer network systems.

---

## Recommended Creators

Technical channels focusing on low-level systems engineering, software architecture, mathematics, and engine design:

- **[TsodingDaily](https://www.youtube.com/@TsodingDaily)**
- **[ThePrimeTimeagen](https://www.youtube.com/@ThePrimeTimeagen)**
- **[CakeZ](https://www.youtube.com/@Cakez77)**
- **[Artful Bytes](https://www.youtube.com/@artfulbytes)**
- **[hoff._world](https://www.youtube.com/@hoff._world)**
- **[tokyospliff](https://youtube.com/@tokyospliff)**
- **[Sebastian Lague](https://youtube.com/@sebastianlague)**
- **[javidx9](https://youtube.com/@javidx9)**
- **[3Blue1Brown](https://youtube.com/@3blue1brown)**
- **[Code Guild](https://youtube.com/@code-guild)**

---

## Web Interface

Browse all resources in an interactive Wikipedia-style reference at:
 **[https://0xtamil.github.io/awesome-low-level/](https://0xtamil.github.io/awesome-low-level/)**

Features:
- **Search & Filter**: Full-text search and multi-tag filtering (by language, topic, or format)
- **Roadmap**: Structured 6-step learning path for beginners
- **Bookmarks**: Save resources locally for quick access
- **Dark/Light Mode**: Wikipedia Vector 2022-style theme with appearance controls
- **Mobile Responsive**: Full-width search bar and optimized layout for mobile

---

## License
[![CC0](http://mirrors.creativecommons.org/presskit/buttons/88x31/svg/cc-zero.svg)](https://creativecommons.org/publicdomain/zero/1.0/)