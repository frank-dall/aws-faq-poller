import Logger = require('bunyan')
import test from 'tape'
import fs from 'fs'
import path from 'path'
import { DomClient } from '../src/lib/DomClient'
import { JSDOM } from 'jsdom';

const ec2html = fs.readFileSync(path.resolve(__dirname, '../fixtures/ec2.html'), 'utf8')
const s3html = fs.readFileSync(path.resolve(__dirname, '../fixtures/s3.html'), 'utf8')

const log = Logger.createLogger({
  name: 'aws-faq-poller-test',
  stream: process.stdout,
  level: Logger.TRACE
})

const ec2DomClient = new DomClient(ec2html, log)
const s3DomClient = new DomClient(s3html, log)

test('parses H2 tags for EC2', (t) => {
  ec2DomClient.setSubjectsFromH2TagsAsArray()
  const actual = ec2DomClient.subjectsFromH2Tags
  const expected = ['General', 'Instance types', 'Accelerated Computing instances', 'Storage', 'Networking and security', 'Management', 'Billing and purchase options', 'Platform', 'Workloads']
  t.deepEqual(actual, expected)
  t.equals(actual.length, expected.length)
  t.end()
})
test('parses H2 tags for s3', (t) => {
  s3DomClient.setSubjectsFromH2TagsAsArray()
  const actual = s3DomClient.subjectsFromH2Tags
  const expected = ['General S3 FAQs', 'AWS Regions', 'Billing', 'Security', 'Durability & Data Protection', 'S3 Intelligent-Tiering', 'S3 Standard-Infrequent Access (S3 Standard-IA)', 'S3 One Zone-Infrequent Access (S3 One Zone-IA)', 'Amazon S3 Glacier', 'Amazon S3 Glacier Deep Archive', 'Query in Place', 'Event Notification', 'Amazon S3 Transfer Acceleration', 'Storage Management', 'Amazon S3 and IPv6', 'Ready to get started?']
  t.deepEqual(actual, expected)
  t.equals(actual.length, expected.length)
  t.end()
})
test('gets h2 node IDs for S3', (t) => {
  s3DomClient.setSubjectsFromH2TagsAsArray()
  s3DomClient.setH2NodeIds()
  const actual = s3DomClient.h2NodeIds
  const expected = ['General_S3_FAQs', 'AWS_Regions', 'Billing', 'Security', 'Durability_.26_Data_Protection', 'S3_Intelligent-Tiering', 'S3_Standard-Infrequent_Access_.28S3_Standard-IA.29', 'S3_One_Zone-Infrequent_Access_.28S3_One_Zone-IA.29', 'Amazon_S3_Glacier', 'Amazon_S3_Glacier_Deep_Archive', 'Query_in_Place', 'Event_Notification', 'Amazon_S3_Transfer_Acceleration', 'Storage_Management', 'Amazon_S3_and_IPv6', 'Ready_to_get_started.3F']
  t.deepEqual(actual, expected)
  t.end()
})
test('gets h2 node IDs for EC2', (t) => {
  ec2DomClient.setSubjectsFromH2TagsAsArray()
  ec2DomClient.setH2NodeIds()
  const actual = ec2DomClient.h2NodeIds
  const expected = ['General', 'Instance_types', 'Accelerated_Computing_instances', 'Storage', 'Networking_and_security', 'Management', 'Billing_and_purchase_options', 'Platform', 'Workloads']
  t.deepEqual(actual, expected)
  t.end()
})
test('parser should check for QA in h2 if no h3 tags', (t) => {
  s3DomClient.setSubjectsFromH2TagsAsArray()
  s3DomClient.setH2NodeIds()
  s3DomClient.setQAndAs('test')
  const actual = s3DomClient.subjectAndCategoryAndQas

  t.equal(actual.length, 181)
  t.end()
})


test('sets subject and category and QAs for EC2', (t) => {
  ec2DomClient.setSubjectsFromH2TagsAsArray()
  ec2DomClient.setH2NodeIds()
  ec2DomClient.setQAndAs('test')
  const actual = ec2DomClient.subjectAndCategoryAndQas

  t.equal(actual.length, 438)
  t.end()
})

test('parses category', (t) => {
  const html = `<main role="main"> 
    <div class="lb-none-v-margin lb-grid"> 
     <div class="lb-row lb-row-max-large lb-snap"> 
      <div class="lb-col lb-tiny-24 lb-mid-24"> 
       <div class="lb-grid"> 
        <div class="lb-row lb-row-max-large lb-snap"> 
         <div class="lb-col lb-tiny-24 lb-mid-24"> 
          <h2 id="General_S3_FAQs" class="lb-txt-bold lb-txt-24 lb-h2 lb-title" style="color:#232f3e;"> General S3 FAQs</h2> 
          <div class="lb-txt-16 lb-rtxt" style="color:#232F3E;"> 
           <p><b>Q:&nbsp; What is Amazon S3?</b></p> 
           <p>Amazon S3 is object storage built to store and retrieve any amount of data from anywhere on the Internet. It’s a simple storage service that offers an extremely durable, highly available, and infinitely scalable data storage infrastructure at very low costs.</p> 
          </div> 
          <div class="lb-txt-16 lb-rtxt" style="color:#232F3E;"> 
           <p><b>Q:&nbsp; What can I do with Amazon S3?</b></p> 
           <p>Amazon S3 provides a simple web service interface that you can use to store and retrieve any amount of data, at any time, from anywhere on the web. Using this web service, you can easily build applications that make use of Internet storage. Since Amazon S3 is highly scalable and you only pay for what you use, you can start small and grow your application as you wish, with no compromise on performance or reliability.</p> 
           <p>Amazon S3 is also designed to be highly flexible. Store any type and amount of data that you want; read the same piece of data a million times or only for emergency disaster recovery; build a simple FTP application, or a sophisticated web application such as the Amazon.com retail web site. Amazon S3 frees developers to focus on innovation instead of figuring out how to store their data.</p> 
          </div> 
          <div class="lb-txt-16 lb-rtxt" style="color:#232F3E;"> 
           <p><b>Q:&nbsp;&nbsp; How can I get started using Amazon S3?</b></p> 
           <p>To sign up for Amazon S3, click <a href="https://s3.console.aws.amazon.com/s3/home" target="_blank">this link</a>. You must have an Amazon Web Services account to access this service; if you do not already have one, you will be prompted to create one when you begin the Amazon S3 sign-up process. After signing up, please refer to the Amazon S3 documentation and sample code in the <a href="http://docs.aws.amazon.com/AmazonS3/latest/API/RelatedResources.html" target="_blank">Resource Center</a>&nbsp;to begin using Amazon S3.</p> 
          </div>
        </div>
      </div>
    </div>
  </main>`
  const dom = new JSDOM(html)
  const main = dom.window.document.querySelectorAll('[role="main"]')[0]
  const qAndApTags = main.querySelectorAll('p')
  const closest = DomClient.getSubject(qAndApTags[0])
  t.equal(closest, 'General S3 FAQs')
  t.end()
})
test('parses subject', (t) => {
  const html = `<main role="main"> 
    <div class="lb-grid"> 
    <div class="lb-row lb-row-max-large lb-snap"> 
    <div class="lb-col lb-tiny-24 lb-mid-24"> 
      <h2 id="Instance_types" class="lb-txt-bold lb-txt-none lb-txt-24 lb-h2 lb-title" style="color:#232f3e;"> Instance types</h2> 
      <div class="lb-txt-normal lb-rtxt"> 
      <p><a href="#Accelerated_Computing_instances">Accelerated Computing instances</a> |&nbsp;<a href="#Compute_Optimized_instances">Compute Optimized instances</a> | <a href="#General_Purpose_instances">General Purpose instances</a>&nbsp;|&nbsp;<a href="#High_Memory_instances">High Memory instances</a> |&nbsp;<a href="#Memory_Optimized_instances">Memory Optimized instances</a> |&nbsp;<a href="#Previous_Generation_instances">Previous Generation instances</a> |&nbsp;<a href="#Storage_Optimized_instances">Storage Optimized instances</a></p> 
      </div> 
      <h2 id="Accelerated_Computing_instances" class="lb-txt-bold lb-txt-20 lb-h2 lb-title" style="color:#232f3e;"> Accelerated Computing instances</h2> 
      <div class="lb-txt-16 lb-rtxt" style="color:#232F3E;"> 
      <p><b>Q: What are Accelerated Computing instances?</b></p> 
      <p>Accelerated Computing instance family is a family of instances which use hardware accelerators, or co-processors, to perform some functions, such as floating-point number calculation and graphics processing, more efficiently than is possible in software running on CPUs. Amazon EC2 provides three types of Accelerated Computing instances – GPU compute instances for general-purpose computing, GPU graphics instances for graphics intensive applications, and FPGA programmable hardware compute instances for advanced scientific workloads.</p> 
      <p><b>Q. When should I use GPU Graphics and Compute instances?</b></p> 
      <p>GPU instances work best for applications with massive parallelism such as workloads using thousands of threads. Graphics processing is an example with huge computational requirements, where each of the tasks is relatively small, the set of operations performed form a pipeline, and the throughput of this pipeline is more important than the latency of the individual operations. To be able build applications that exploit this level of parallelism, one needs GPU device specific knowledge by understanding how to program against various graphics APIs (DirectX, OpenGL) or GPU compute programming models (CUDA, OpenCL).</p> 
      <p><b>Q: How are P3 instances different from G3 instances?</b></p> 
      <p>P3 instances are the next-generation of EC2 general-purpose GPU computing instances, powered by up to 8 of the latest-generation NVIDIA Tesla V100 GPUs. These new instances significantly improve performance and scalability, and add many new features, including new Streaming Multiprocessor (SM) architecture for machine learning (ML)/deep learning (DL) performance optimization, second-generation NVIDIA NVLink high-speed GPU interconnect, and highly tuned HBM2 memory for higher-efficiency.</p> 
      <p>G3 instances use NVIDIA Tesla M60 GPUs and provide a high-performance platform for graphics applications using DirectX or OpenGL. NVIDIA Tesla M60 GPUs support NVIDIA GRID Virtual Workstation features, and H.265 (HEVC) hardware encoding. Each M60 GPU in G3 instances supports 4 monitors with resolutions up to 4096x2160, and is licensed to use NVIDIA GRID Virtual Workstation for one Concurrent Connected User. Example applications of G3 instances include 3D visualizations, graphics-intensive remote workstation, 3D rendering, application streaming, video encoding, and other server-side graphics workloads.</p> 
      <p><b>Q: What are the benefits of NVIDIA Volta GV100 GPUs?</b></p> 
      <p>The new NVIDIA Tesla V100 accelerator incorporates the powerful new Volta GV100 GPU. GV100 not only builds upon the advances of its predecessor, the Pascal GP100 GPU, it significantly improves performance and scalability, and adds many new features that improve programmability. These advances will supercharge HPC, data center, supercomputer, and deep learning systems and applications.</p> 
      <p><b>Q: Who will benefit from P3 instances?</b></p> 
      <p>P3 instances with their high computational performance will benefit users in artificial intelligence (AI), machine learning (ML), deep learning (DL) and high performance computing (HPC) applications. Users includes data scientists, data architects, data analysts, scientific researchers, ML engineers, IT managers and software developers. Key industries include transportation, energy/oil &amp; gas, financial services (banking, insurance), healthcare, pharmaceutical, sciences, IT, retail, manufacturing, high-tech, transportation, government, academia, among many others.</p> 
      <p><b>Q: What are some key use cases of P3 instances?</b></p> 
      <p>P3 instance use GPUs to accelerate numerous deep learning systems and applications including autonomous vehicle platforms, speech, image, and text recognition systems, intelligent video analytics, molecular simulations, drug discovery, disease diagnosis, weather forecasting, big data analytics, financial modeling, robotics, factory automation, real-time language translation, online search optimizations, and personalized user recommendations, to name just a few.</p> 
      <p><b>Q: Why should customers use GPU-powered Amazon P3 instances for AI/ML and HPC?</b></p> 
      <p>GPU-based compute instances provide greater throughput and performance because they are designed for massively parallel processing using thousands of specialized cores per GPU, versus CPUs offering sequential processing with a few cores. In addition, developers have built hundreds of GPU-optimized scientific HPC applications such as quantum chemistry, molecular dynamics, meteorology, among many others. Research indicates that over 70% of the most popular HPC applications provide built-in support for GPUs.</p> 
      <p><b>Q: Will P3 instances support EC2 Classic networking and Amazon VPC?</b></p> 
      <p>P3 instances will support VPC only.</p> 
      <p><b>Q. How are G3 instances different from P2 instances?</b></p> 
      <p>G3 instances use NVIDIA Tesla M60 GPUs and provide a high-performance platform for graphics applications using DirectX or OpenGL. NVIDIA Tesla M60 GPUs support NVIDIA GRID Virtual Workstation features, and H.265 (HEVC) hardware encoding. Each M60 GPU in G3 instances supports 4 monitors with resolutions up to 4096x2160, and is licensed to use NVIDIA GRID Virtual Workstation for one Concurrent Connected User. Example applications of G3 instances include 3D visualizations, graphics-intensive remote workstation, 3D rendering, application streaming, video encoding, and other server-side graphics workloads.</p> 
      <p>P2 instances use NVIDIA Tesla K80 GPUs and are designed for general purpose GPU computing using the CUDA or OpenCL programming models. P2 instances provide customers with high bandwidth 25 Gbps networking, powerful single and double precision floating-point capabilities, and error-correcting code (ECC) memory, making them ideal for deep learning, high performance databases, computational fluid dynamics, computational finance, seismic analysis, molecular modeling, genomics, rendering, and other server-side GPU compute workloads.</p> 
      <p><b>Q: How are P3 instances different from P2 instances?</b></p> 
      <p>P3 Instances are the next-generation of EC2 general-purpose GPU computing instances, powered by up to 8 of the latest-generation NVIDIA Volta GV100 GPUs. These new instances significantly improve performance and scalability and add many new features, including new Streaming Multiprocessor (SM) architecture, optimized for machine learning (ML)/deep learning (DL) performance, second-generation NVIDIA NVLink high-speed GPU interconnect, and highly tuned HBM2 memory for higher-efficiency.</p> 
      <p>P2 instances use NVIDIA Tesla K80 GPUs and are designed for general purpose GPU computing using the CUDA or OpenCL programming models. P2 instances provide customers with high bandwidth 25 Gbps networking, powerful single and double precision floating-point capabilities, and error-correcting code (ECC) memory.</p> 
      <p><b>Q. What APIs and programming models are supported by GPU Graphics and Compute instances?</b></p> 
      <p>P3 instances support CUDA 9 and OpenCL, P2 instances support CUDA 8 and OpenCL 1.2 and G3 instances support DirectX 12, OpenGL 4.5, CUDA 8, and OpenCL 1.2.</p> 
      <p><b>Q. Where do I get NVIDIA drivers for P3 and G3 instances?</b></p> 
      <p>There are two methods by which NVIDIA drivers may be obtained. There are listings on the <a href="https://aws.amazon.com/marketplace/search/results/?searchTerms=GPU">AWS Marketplace</a> which offer Amazon Linux AMIs and Windows Server AMIs with the NVIDIA drivers pre-installed. You may also launch 64-bit, HVM AMIs and install the drivers yourself. You must visit the NVIDIA driver website and search for the NVIDIA Tesla V100 for P3, NVIDIA Tesla K80 for P2, and NVIDIA Tesla M60 for G3 instances.</p> 
      <p><b>Q. Which AMIs can I use with P3, P2 and G3 instances?</b></p> 
      <p>You can currently use Windows Server, SUSE Enterprise Linux, Ubuntu, and Amazon Linux AMIs on P2 and G3 instances. P3 instances only support HVM AMIs. If you want to launch AMIs with operating systems not listed here, contact AWS <a href="/contact-us/">Customer Support</a> with your request or reach out through <a href="https://forums.aws.amazon.com/forum.jspa?forumID=30#">EC2 Forums</a>.</p> 
      <p><b>Q. Does the use of G2 and G3 instances require third-party licenses?</b></p> 
      <p>Aside from the NVIDIA drivers and GRID SDK, the use of G2 and G3 instances does not necessarily require any third-party licenses. However, you are responsible for determining whether your content or technology used on G2 and G3 instances requires any additional licensing. For example, if you are streaming content you may need licenses for some or all of that content. If you are using third-party technology such as operating systems, audio and/or video encoders, and decoders from Microsoft, Thomson, Fraunhofer IIS, Sisvel S.p.A., MPEG-LA, and Coding Technologies, please consult these providers to determine if a license is required. For example, if you leverage the on-board h.264 video encoder on the NVIDIA GRID GPU you should reach out to MPEG-LA for guidance, and if you use mp3 technology you should contact Thomson for guidance.</p> 
      <p><b>Q. Why am I not getting NVIDIA GRID features on G3 instances using the driver downloaded from NVIDIA website?</b></p> 
      <p>The NVIDIA Tesla M60 GPU used in G3 instances requires a special NVIDIA GRID driver to enable all advanced graphics features, and 4 monitors support with resolution up to 4096x2160. You need to use an AMI with NVIDIA GRID driver pre-installed, or download and install the NVIDIA GRID driver following the AWS documentation.</p> 
      <p><b>Q. Why am I unable to see the GPU when using Microsoft Remote Desktop?</b></p> 
      <p>When using Remote Desktop, GPUs using the WDDM driver model are replaced with a non-accelerated Remote Desktop display driver. In order to access your GPU hardware, you need to utilize a different remote access tool, such as VNC.</p> 
      <p><b>Q. What is Amazon EC2 F1?</b></p> 
      <p>Amazon EC2 F1 is a compute instance with programmable hardware you can use for application acceleration. The new F1 instance type provides a high performance, easy to access FPGA for developing and deploying custom hardware accelerations.</p> 
      <p><b>Q. What are FPGAs and why do I need them?</b></p> 
      <p>FPGAs are programmable integrated circuits that you can configure using software. By using FPGAs you can accelerate your applications up to 30x when compared with servers that use CPUs alone. And, FPGAs are reprogrammable, so you get the flexibility to update and optimize your hardware acceleration without having to redesign the hardware.</p> 
      <p><b>Q. How does F1 compare with traditional FPGA solutions?</b></p> 
      <p>F1 is an AWS instance with programmable hardware for application acceleration. With F1, you have access to FPGA hardware in a few simple clicks, reducing the time and cost of full-cycle FPGA development and scale deployment from months or years to days. While FPGA technology has been available for decades, adoption of application acceleration has struggled to be successful in both the development of accelerators and the business model of selling custom hardware for traditional enterprises, due to time and cost in development infrastructure, hardware design, and at-scale deployment. With this offering, customers avoid the undifferentiated heavy lifting associated with developing FPGAs in on-premises data centers.</p> 
      <p><b>Q: What is an Amazon FPGA Image (AFI)?</b></p> 
      <p>The design that you create to program your FPGA is called an Amazon FPGA Image (AFI). AWS provides a service to register, manage, copy, query, and delete AFIs. After an AFI is created, it can be loaded on a running F1 instance. You can load multiple AFIs to the same F1 instance, and can switch between AFIs in runtime without reboot. This lets you quickly test and run multiple hardware accelerations in rapid sequence. You can also offer to other customers on the AWS Marketplace a combination of your FPGA acceleration and an AMI with custom software or AFI drivers.</p> 
      <p><b>Q. How do I list my hardware acceleration on the AWS Marketplace?</b></p> 
      <p>You would develop your AFI and the software drivers/tools to use this AFI. You would then package these software tools/drivers into an Amazon Machine Image (AMI) in an encrypted format. AWS manages all AFIs in the encrypted format you provide to maintain the security of your code. To sell a product in the AWS Marketplace, you or your company must sign up to be an AWS Marketplace reseller, you would then submit your AMI ID and the AFI ID(s) intended to be packaged in a single product. AWS Marketplace will take care of cloning the AMI and AFI(s) to create a product, and associate a product code to these artifacts, such that any end-user subscribing to this product code would have access to this AMI and the AFI(s).</p> 
      <p><b>Q. What is available with F1 instances?</b></p> 
      <p>For developers, AWS is providing a Hardware Development Kit (HDK) to help accelerate development cycles, a FPGA Developer AMI for development in the cloud, an SDK for AMIs running the F1 instance, and a set of APIs to register, manage, copy, query, and delete AFIs. Both developers and customers have access to the AWS Marketplace where AFIs can be listed and purchased for use in application accelerations.</p> 
      <p><b>Q. Do I need to be a FPGA expert to use an F1 instance?</b></p> 
      <p>AWS customers subscribing to a F1-optimized AMI from AWS Marketplace do not need to know anything about FPGAs to take advantage of the accelerations provided by the F1 instance and the AWS Marketplace. Simply subscribe to an F1-optimized AMI from the AWS Marketplace with an acceleration that matches the workload. The AMI contains all the software necessary for using the FPGA acceleration. Customers need only write software to the specific API for that accelerator and start using the accelerator.</p> 
      <p><b>Q. I’m a FPGA developer, how do I get started with F1 instances?</b></p> 
      <p>Developers can get started on the F1 instance by creating an AWS account and downloading the AWS Hardware Development Kit (HDK). The HDK includes documentation on F1, internal FPGA interfaces, and compiler scripts for generating AFI. Developers can start writing their FPGA code to the documented interfaces included in the HDK to create their acceleration function. Developers can launch AWS instances with the FPGA Developer AMI. This AMI includes the development tools needed to compile and simulate the FPGA code. The Developer AMI is best run on the latest C5, M5, or R4 instances. Developers should have experience in the programming languages used for creating FPGA code (i.e. Verilog or VHDL) and an understanding of the operation they wish to accelerate.</p> 
      <p><b>Q. I’m not an FPGA developer, how do I get started with F1 instances?</b></p> 
      <p>Customers can get started with F1 instances by selecting an accelerator from the AWS Marketplace, provided by AWS Marketplace sellers, and launching an F1 instance with that AMI. The AMI includes all of the software and APIs for that accelerator. AWS manages programming the FPGA with the AFI for that accelerator. Customers do not need any FPGA experience or knowledge to use these accelerators. They can work completely at the software API level for that accelerator.</p> 
      <p><b>Q. Does AWS provide a developer kit?</b></p> 
      <p>Yes. The Hardware Development Kit (HDK) includes simulation tools and simulation models for developers to simulate, debug, build, and register their acceleration code. The HDK includes code samples, compile scripts, debug interfaces, and many other tools you will need to develop the FPGA code for your F1 instances. You can use the HDK either in an AWS provided AMI, or in your on-premises development environment. These models and scripts are available publically with an AWS account.</p> 
      <p><b>Q. Can I use the HDK in my on-premises development environment?</b></p> 
      <p>Yes. You can use the Hardware Development Kit HDK either in an AWS-provided AMI, or in your on-premises development environment.</p> 
      <p><b>Q. Can I add an FPGA to any EC2 instance type?</b></p> 
      <p>No. F1 instances comes in two instance sizes f1.2xlarge and f1.16 xlarge.<br /> </p> 
      </div> 
    </div> 
    </div> 
  </div> 
  <div class="lb-grid"> 
    <div class="lb-row lb-row-max-large lb-snap"> 
    <div class="lb-col lb-tiny-24 lb-mid-24"> 
      <h3 id="Compute_Optimized_instances" class="lb-txt-bold lb-txt-20 lb-h3 lb-title" style="color:#232f3e;"> Compute Optimized instances</h3> 
      <div class="lb-txt-16 lb-rtxt" style="color:#232F3E;"> 
      <p><b>Q. When should I use Compute Optimized instances?</b></p> 
      <p>Compute Optimized instances are designed for applications that benefit from high compute power. These applications include compute-intensive applications like high-performance web servers, high-performance computing (HPC), scientific modelling, distributed analytics and machine learning inference.</p> 
      <p><b>Q. Can I launch C4 instances as Amazon EBS-optimized instances?</b></p> 
      <p>Each C4 instance type is EBS-optimized by default. C4 instances 500 Mbps to 4,000 Mbps to EBS above and beyond the general-purpose network throughput provided to the instance. Since this feature is always enabled on C4 instances, launching a C4 instance explicitly as EBS-optimized will not affect the instance's behavior.</p> 
      <p><b>Q. How can I use the processor state control feature available on the c4.8xlarge instance?</b></p> 
      <p>The c4.8xlarge instance type provides the ability for an operating system to control processor C-states and P-states. This feature is currently available only on Linux instances. You may want to change C-state or P-state settings to increase processor performance consistency, reduce latency, or tune your instance for a specific workload. By default, Amazon Linux provides the highest-performance configuration that is optimal for most customer workloads; however, if your application would benefit from lower latency at the cost of higher single- or dual-core frequencies, or from lower-frequency sustained performance as opposed to bursty Turbo Boost frequencies, then you should consider experimenting with the C-state or P-state configuration options that are available to these instances. For additional information on this feature, see the Amazon EC2 User Guide section on <a href="http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/processor_state_control.html">Processor State Control</a>.</p> 
      <p><b>Q. Which instances are available within Compute Optimized instances category?</b></p> 
      <p><b>C5 instances:</b> C5 instances are the latest generation of EC2 Compute Optimized instances. C5 instances are based on Intel Xeon Platinum processors, part of the Intel Xeon Scalable (codenamed Skylake-SP) processor family, and are available in 6 sizes and offer up to 72 vCPUs and 144 GiB memory. C5 instances deliver 25% improvement in price/performance compared to C4 instances.</p> 
      <p><b>C4 instances:</b> C4 instances are based on Intel Xeon E5-2666 v3 (codenamed Haswell) processors. C4 instances are available in 5 sizes and offer up to 36 vCPUs and 60 GiB memory.</p> 
      <p><b>Q. Should I move my workloads from C3 or C4 instances to C5 instances?</b></p> 
      <p>The generational improvement in CPU performance and lower price of C5 instances, which combined result in a 25% price/performance improvement relative to C4 instances, benefit a broad spectrum of workloads that currently run on C3 or C4 instances. For floating point intensive applications, Intel AVX-512 enables significant improvements in delivered TFLOPS by effectively extracting data level parallelism. Customers looking for absolute performance for graphics rendering and HPC workloads that can be accelerated with GPUs or FPGAs should also evaluate other instance families in the Amazon EC2 portfolio that include those resources to find the ideal instance for their workload.</p> 
      <p><b>Q. Which operating systems/AMIs are supported on C5 Instances?</b></p> 
      <p>EBS backed HVM AMIs with support for ENA networking and booting from NVMe-based storage can be used with C5 instances. The following AMIs are supported on C5:</p> 
      <ul> 
        <li>Amazon Linux 2014.03 or newer<br /> </li> 
        <li>Ubuntu 14.04 or newer</li> 
        <li>SUSE Linux Enterprise Server 12 or newer</li> 
        <li>Red Hat Enterprise Linux 7.4 or newer</li> 
        <li>CentOS 7 or newer</li> 
        <li>Windows Server 2008 R2</li> 
        <li>Windows Server 2012</li> 
        <li>Windows Server 2012 R2</li> 
        <li>Windows Server 2016</li> 
        <li>FreeBSD 11.1-RELEASE<br /> </li> 
      </ul> 
      <p>For optimal local NVMe-based SSD storage performance on C5d, Linux kernel version 4.9+ is recommended.</p> 
      <p><b>Q. What are the storage options available to C5 customers?</b></p> 
      <p>C5 instances use EBS volumes for storage, are EBS-optimized by default, and offer up to 9 Gbps throughput to both encrypted and unencrypted EBS volumes. C5 instances access EBS volumes via PCI attached NVM Express (NVMe) interfaces. NVMe is an efficient and scalable storage interface commonly used for flash based SSDs such as local NVMe storage provided with I3 and I3en instances. Though the NVMe interface may provide lower latency compared to Xen paravirtualized block devices, when used to access EBS volumes the volume type, size, and provisioned IOPS (if applicable) will determine the overall latency and throughput characteristics of the volume. When NVMe is used to provide EBS volumes, they are attached and detached by PCI hotplug.</p> 
      <p><b>Q. What network interface is supported on C5 instances?</b></p> 
      <p>C5 instances use the Elastic Network Adapter (ENA) for networking and enable Enhanced Networking by default. With ENA, C5 instances can utilize up to 25 Gbps of network bandwidth.</p> 
      <p><b>Q. Which storage interface is supported on C5 instances?</b></p> 
      <p>C5 instances will support only NVMe EBS device model. EBS volumes attached to C5 instances will appear as NVMe devices. NVMe is a modern storage interface that provides latency reduction and results in increased disk I/O and throughput.</p> 
      <p><b>Q. How many EBS volumes can be attached to C5 instances?</b></p> 
      <p>C5 instances support a maximum for 27 EBS volumes for all Operating systems. The limit is shared with ENI attachments which can be found here http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html. For example: since every instance has at least 1 ENI, if you have 3 additional ENI attachments on the c4.2xlarge, you can attach 24 EBS volumes to that instance.</p> 
      <p><b>Q. What is the underlying hypervisor on C5 instances?</b></p> 
      <p>C5 instances use a new EC2 hypervisor that is based on core KVM technology.</p> 
      <p><b>Q: Why does the total memory reported by&nbsp;the operating system not match the advertised memory of the C5 instance type?</b></p> 
      <p>In C5, portions of the total memory for an instance are reserved from use by the Operating System including areas used by the virtual BIOS for things like ACPI tables and for devices like the virtual video RAM.<br /> </p> 
      </div> 
    </div> 
    </div> 
  </div>
  </main>`
  const dom = new JSDOM(html)
  const main = dom.window.document.querySelectorAll('[role="main"]')[0]
  const qAndApTags = main.querySelectorAll('p')
  const closest = DomClient.getSubject(qAndApTags[0])
  t.equal(closest, 'Instance types')
  t.end()
})
