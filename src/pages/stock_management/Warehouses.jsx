import React from 'react';
import { Link } from 'react-router';
import { warehouses } from '../../data/data';
import { Plus, Warehouse, MapPin } from 'lucide-react';

const Warehouses = () => {
  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Warehouses</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Select a warehouse to view its inventory.
            </p>
          </div>
          <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start">
            <Plus size={20} />
            Add Warehouse
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <Link to={`/stock/${warehouse.name}`} key={warehouse.id}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Warehouse className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Warehouse #{warehouse.id}</p>
                    <h2 className="text-lg font-semibold text-gray-800">{warehouse.name}</h2>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{warehouse.address}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Warehouses;
