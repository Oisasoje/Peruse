import Image from "next/image";

const page = () => {
  return (
    <section className="min-h-screen text-white flex flex-col items-center  bg-[#131f24] py-4  px-4  sm:px-6 lg:py-3 w-full">
      <div className="max-w-3xl justify-center flex h-screen w-full md:ml-60">
        <div className="border-4 gap-8 flex w-200 border-blue-500 p-4 rounded-lg">
          <div className="w-100 ">
            <Image
              src="/assets/Arena-img.jpg"
              alt="Arena Image"
              width={200}
              height={200}
              unoptimized
              className="w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span>The arena opens. </span> <span>Ten pods. One winner.</span>{" "}
            <span>
              Your pod counts on your clarity, your speed, your depth.
            </span>
            <span>
              Three questions stand between your pod and bragging rights.
            </span>
            <span>Make them count.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
export default page;
