import SideBar from "@/components/SideBar";
import ChatContainer from "@/components/ChatContainer";


export default function HomePage() 
  {
  
    return (
      <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center pt-20 px-4">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <h1>this is home page</h1>
              <SideBar />
               <ChatContainer />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  