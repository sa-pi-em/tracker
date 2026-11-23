/* Syllabus coverage is transcribed from the official PDFs in this workspace.
   GATE General Aptitude is common to every paper and is included alongside EC. */
window.SYLLABI = {
  gate: {
    short: 'GATE EC', name: 'GATE 2027 · Electronics & Communication', subtitle: 'EC syllabus + the common General Aptitude section', sigil: 'G', sourceFile:'EC_GATE2027_Syllabus.pdf', sourcePages:'Official EC syllabus · pages 1–2',
    groups: ['General Aptitude', 'Technical EC'],
    chapters: [
      { id:'ga-verbal', group:'General Aptitude', title:'Verbal aptitude', topics:[
        'English grammar and sentence structure','Vocabulary and word usage','Reading comprehension','Narrative sequencing of sentences'
      ]},
      { id:'ga-quant', group:'General Aptitude', title:'Quantitative aptitude', topics:[
        'Data interpretation: tables, graphs and charts','Numerical computation and estimation','Mensuration','Geometry','Elementary statistics','Probability'
      ]},
      { id:'ga-analytical', group:'General Aptitude', title:'Analytical aptitude', topics:[
        'Deduction and logical reasoning','Induction','Analogies','Numerical relations and patterns'
      ]},
      { id:'ga-spatial', group:'General Aptitude', title:'Spatial aptitude', topics:[
        'Transformation of 2D and 3D shapes','Rotation and scaling','Mirroring','Assembly and disassembly of 2D and 3D shapes'
      ]},
      { id:'math', group:'Technical EC', title:'Engineering Mathematics', topics:[
        'Vector spaces and basis','Linear dependence and independence','Matrix algebra','Eigenvalues and eigenvectors','Rank of a matrix','Systems of linear equations: existence and uniqueness',
        'Mean value theorems','Theorems of integral calculus','Definite and improper integrals','Partial derivatives','Maxima and minima','Multiple integrals','Line, surface and volume integrals','Taylor series',
        'Linear differential equations','Euler–Cauchy equations','Nonhomogeneous differential equations','Variation of parameters','Complementary function and particular integral','Partial differential equations','Variable separable method','Initial and boundary value problems',
        'Vectors in plane and space','Vector operations','Gradient, divergence and curl','Gauss, Green and Stokes theorems',
        'Analytic functions','Cauchy integral theorem and formula','Sequences and series','Convergence tests','Taylor and Laurent series','Residue theorem',
        'Mean, median, mode and standard deviation','Combinatorial probability','Probability distributions: binomial, Poisson, exponential and normal','Joint and conditional probability','Correlation and regression analysis'
      ]},
      { id:'networks', group:'Technical EC', title:'Networks, Signals & Systems', topics:[
        'Node and mesh analysis','Superposition, Thevenin, Norton and reciprocity theorems','Sinusoidal steady state and phasors','Complex power and maximum power transfer','RL, RC and RLC circuit analysis in time and frequency domains','Network equations using Laplace transforms','Linear two-port network parameters','Wye–delta transformation',
        'LTI system definition and properties','Causality and stability','Impulse response and convolution','Poles, zeros and frequency response','Group delay and phase delay',
        'Continuous-time Fourier series and Fourier transform','Nyquist sampling theorem','Sampling and signal reconstruction','DTFT and DFT','Z-transform','FIR and IIR filter design'
      ]},
      { id:'devices', group:'Technical EC', title:'Electronic Devices', topics:[
        'Energy-band formation in solids','Intrinsic and extrinsic semiconductor energy bands','Equilibrium carrier concentration','Direct and indirect band-gap semiconductors','Diffusion current and drift current','Mobility and resistivity','Carrier generation and recombination','Poisson and continuity equations',
        'P–N junction','Zener diode','Bipolar junction transistor (BJT)','MOS capacitor','MOSFET','MOSFET scaling','LED','Photodiode','Solar cell'
      ]},
      { id:'analog', group:'Technical EC', title:'Analog Circuits', topics:[
        'Diode clippers','Diode clampers','Rectifiers','BJT amplifier biasing','MOSFET amplifier biasing','AC coupling and small-signal analysis','Amplifier frequency response','Current mirrors','Differential amplifiers',
        'Op-amp amplifiers and summers','Differentiator and integrator circuits','Active filters','Schmitt trigger','Oscillators','Dominant-pole (Miller) compensation','Phase margin'
      ]},
      { id:'digital', group:'Technical EC', title:'Digital Circuits', topics:[
        'Binary number representation','Integer and floating-point representation','Boolean algebra and function minimization','Karnaugh maps and Boolean identities','Logic gates and static CMOS implementations','Arithmetic circuits','Code converters','Multiplexers and decoders',
        'Latches and flip-flops','Counters and shift registers','Finite-state machines','Propagation delay, setup time and hold time','Critical path delay','Sample-and-hold circuits','Analog-to-digital converters (ADCs)','Digital-to-analog converters (DACs)','ROM, SRAM and DRAM',
        'Machine instructions and addressing modes','ALU, datapath and control unit','Instruction pipelining'
      ]},
      { id:'control', group:'Technical EC', title:'Control Systems', topics:[
        'Basic control-system components','Feedback principle','Transfer functions','Block-diagram representation','Signal-flow graphs','Transient and steady-state analysis of LTI systems','Frequency response','Routh–Hurwitz stability criterion','Nyquist stability criterion','Bode plots and root-locus plots','Compensators and PID controller','State-variable model and LTI state-equation solution'
      ]},
      { id:'communications', group:'Technical EC', title:'Communications', topics:[
        'Autocorrelation and power spectral density','White-noise properties','Filtering random signals through LTI systems','Amplitude modulation and demodulation','Angle modulation and demodulation','AM and FM spectra','Superheterodyne receivers','Entropy and source coding','Mutual information','Channel-capacity theorem',
        'PCM and DPCM','ASK, PSK, FSK and QAM','Bandwidth and inter-symbol interference','MAP and ML detection','Matched-filter receiver','SNR and BER','Error-correction fundamentals','Hamming codes and CRC'
      ]},
      { id:'electromagnetics', group:'Technical EC', title:'Electromagnetics', topics:[
        'Maxwell equations: differential and integral forms','Physical interpretation and boundary conditions','Wave equation and Poynting vector','Plane-wave reflection and refraction','Polarization','Phase and group velocity','Propagation through different media','Skin depth','Transmission-line equations and characteristic impedance','Impedance matching and transformation','S-parameters and Smith chart','Rectangular and circular waveguides','Light propagation in optical fibres','Dipole and monopole antennas','Linear antenna arrays'
      ]}
    ]
  },
  ese: {
    short: 'UPSC ESE E&T', name: 'UPSC ESE 2027 · Electronics & Telecommunication', subtitle: 'The common GS & Engineering Aptitude paper plus all E&T subject topics listed across Papers I and II', sigil: 'E', sourceFile:'Notif-ESEP-2027-Engl-160926.pdf', sourcePages:'Official notification · Section III, pages 42 and 48–50',
    groups: ['General Studies', 'Paper I', 'Paper II'],
    chapters: [
      { id:'ese-general', group:'General Studies', title:'General Studies & Engineering Aptitude', topics:[
        'Current issues of national and international importance: social development','Current issues: economic and industrial development','Engineering aptitude: logical reasoning','Engineering aptitude: analytical ability','Engineering mathematics','Numerical analysis','General principles of design','Engineering drawing','Importance of safety','Standards and quality practices in production','Standards and quality practices in construction, maintenance and services',
        'Energy conservation','Environmental pollution and degradation','Climate change','Environmental impact assessment','Basics of project management','Basics of material science and engineering','ICT tools and their engineering applications: networking','ICT tools: e-governance and technology-based education','Ethics and values in the engineering profession'
      ]},
      { id:'ese-basic-electronics', group:'Paper I', title:'Basic Electronics Engineering', topics:[
        'Semiconductor fundamentals','Diode fundamentals and characteristics','Transistor fundamentals and characteristics','Diodes for different uses','Bipolar junction transistors (BJTs)','JFETs and MOSFETs','Transistor amplifiers of different types','Oscillators and other electronic circuits','Integrated-circuit fundamentals','Bipolar, MOS and CMOS ICs','Linear ICs and op-amp linear applications','Op-amp nonlinear applications','Optical sources and detectors','Optoelectronics and its applications'
      ]},
      { id:'ese-basic-electrical', group:'Paper I', title:'Basic Electrical Engineering', topics:[
        'DC circuits: Ohm and Kirchhoff laws','Mesh and nodal analysis','Circuit theorems','Electromagnetism: Faraday and Lenz laws','Induced EMF and its uses','Single-phase AC circuits','Transformers and efficiency','DC machines: fundamentals','Induction machines: fundamentals','Synchronous machines: fundamentals','Hydroelectric, thermal and nuclear power sources','Wind and solar power sources','Batteries and their uses'
      ]},
      { id:'ese-materials', group:'Paper I', title:'Materials Science', topics:[
        'Electrical engineering materials','Crystal structures and defects','Ceramic structures, composites, processing and uses','Insulating laminates for electronics: structures, properties and uses','Magnetic-material fundamentals and classification','Ferrites and ferro-/paramagnetic materials and components','Nanomaterials: fundamentals and preparation','Nanomaterial purification and sintering','Nanoparticles and uses','Nano-optical, nano-magnetic and nano-electronic materials and uses','Superconductivity and uses'
      ]},
      { id:'ese-measurements', group:'Paper I', title:'Electronic Measurements & Instrumentation', topics:[
        'Measurement principles, accuracy, precision and standards','Analog and digital measurement systems','Measuring instruments for different applications','Static and dynamic characteristics of measurement systems','Measurement errors, statistical analysis and curve fitting','Measurement systems for non-electrical quantities','Telemetry fundamentals','Transducer types and displays','Data-acquisition system fundamentals'
      ]},
      { id:'ese-network', group:'Paper I', title:'Network Theory', topics:[
        'Network graphs and matrices','Wye–delta transformation','Linear constant-coefficient differential equations','Time-domain analysis of RLC circuits','Network equations using Laplace transforms','Frequency-domain analysis of RLC circuits','Two-port network parameters','Driving-point and transfer functions','State equations for networks','Steady-state sinusoidal analysis'
      ]},
      { id:'ese-analog-digital', group:'Paper I', title:'Analog & Digital Circuits', topics:[
        'Small-signal equivalent circuits of diodes, BJTs and FETs','Diode circuits for different uses','BJT and JFET amplifier biasing and stability','Single-stage and multistage amplifier analysis and design','Feedback and its uses','Active filters','Timers and multipliers','Wave-shaping circuits','A/D and D/A converters','Boolean algebra and uses','Logic gates and digital IC families','Combinational and sequential circuits','Multiplexers','Counters, registers and memories','Microprocessor basics, design and applications'
      ]},
      { id:'ese-communication', group:'Paper II', title:'Analog & Digital Communication Systems', topics:[
        'Random signals and noise','Probability theory and information theory','Analog versus digital communication and applications','AM and FM systems: theory, practice and standards','Transmitters and receivers','Signal-to-noise ratio comparison','Digital communication: sampling, quantizing and coding','PCM and DPCM','Audio/video multiplexing','ASK, FSK and PSK digital modulation','TDMA, FDMA and CDMA multiple access','Optical communication and fibre optics: theory, practice and standards'
      ]},
      { id:'ese-control', group:'Paper II', title:'Control Systems', topics:[
        'Classification of signals and systems','Applications of signal and system theory','System realization','Transforms and their applications','Signal-flow graphs','Routh–Hurwitz criterion','Root-locus plots','Nyquist and Bode plots','Open-loop and closed-loop feedback systems','Stability analysis','Steady-state, transient and frequency-response analysis','Control-system design','Compensators and lead/lag compensation','PID and industrial controllers'
      ]},
      { id:'ese-computer', group:'Paper II', title:'Computer Organization & Architecture', topics:[
        'Basic architecture, CPU and trends','I/O and memory organization','Peripheral devices','Hardware and software issues','Data representation and programming','Operating-system fundamentals, processes, characteristics and applications','Memory management and virtual memory','File systems, protection and security','Database types, characteristics and design','Transactions and concurrency control','Elements of programming languages and typical examples'
      ]},
      { id:'ese-em', group:'Paper II', title:'Electromagnetics', topics:[
        'Elements of vector calculus','Maxwell equations: basic concepts','Gauss and Stokes theorems','Wave propagation through different media','Transmission-line types and fundamentals','Smith chart','Impedance matching and transformation','Pulse excitation and applications','Waveguide fundamentals','Rectangular waveguides and modes','Cut-off frequency and dispersion','Dielectric waveguide types','Antenna radiation patterns','Monopole and dipole antennas','Antenna gain','Active and passive arrays: theory and uses'
      ]},
      { id:'ese-advanced-electronics', group:'Paper II', title:'Advanced Electronics Topics', topics:[
        'VLSI technology: processing, lithography, interconnects, packaging and testing','VLSI design principles','MUX-, ROM- and PLA-based design','Moore and Mealy circuit design','Pipeline concepts and functions','Design for testability and examples','DSP: discrete-time signals and systems, uses','FIR and IIR digital-filter types and design','Speech, audio and radar signal-processing applications','Microprocessor and microcontroller fundamentals','Interrupts, DMA, instruction sets and interfacing','Controllers and uses','Embedded systems'
      ]},
      { id:'ese-advanced-communication', group:'Paper II', title:'Advanced Communication Topics', topics:[
        'Communication-network principles, practices, technologies and uses','OSI model and network security','Packet-multiplexed streams and scheduling','Cellular-network types and analysis','Cellular protocols: TCP/IP','Microwave and satellite communication: terrestrial and space LOS systems','Block schematics, link calculations and system design','Communication satellites: orbits, characteristics, systems and uses','Fibre-optic communication systems: block schematics','Fibre-optic link calculations and system design'
      ]}
    ]
  }
};
