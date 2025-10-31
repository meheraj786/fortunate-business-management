import React from "react";

const Settings = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-1 overflow-x-hidden">
        <div className="flex flex-col flex-1">
          <main>
            <div className="py-6">
              <div className="px-4 mx-auto sm:px-6 md:px-8">
                <div className="max-w-md">
                  <h1 className="text-lg font-bold text-gray-900">Settings</h1>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Turpis morbi pulvinar venenatis non.
                  </p>
                </div>
              </div>

              <div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                  <nav className="flex flex-wrap gap-4">
                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-transparent rounded-lg hover:text-gray-900 hover:bg-gray-100 group whitespace-nowrap"
                    >
                      Profile
                    </a>

                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-transparent rounded-lg hover:text-gray-900 hover:bg-gray-100 group whitespace-nowrap"
                    >
                      {" "}
                      Password{" "}
                    </a>

                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-transparent rounded-lg hover:text-gray-900 hover:bg-gray-100 group whitespace-nowrap"
                    >
                      {" "}
                      Team{" "}
                    </a>

                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-transparent rounded-lg hover:text-gray-900 hover:bg-gray-100 group whitespace-nowrap"
                    >
                      {" "}
                      Notification{" "}
                    </a>

                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 transition-all duration-200 bg-gray-100 rounded-lg group whitespace-nowrap"
                    >
                      {" "}
                      Billing Details{" "}
                    </a>

                    <a
                      href="#"
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 transition-all duration-200 bg-transparent rounded-lg hover:text-gray-900 hover:bg-gray-100 group whitespace-nowrap"
                    >
                      {" "}
                      Integrations{" "}
                    </a>
                  </nav>
                </div>

                <div className="mt-8"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
