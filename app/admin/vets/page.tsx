import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function VetsPage() {

   const vets = [
      {
         id: 1,
         name: "Dr. Sarah Smith",
         specialty: "General Surgeon",
         status: "Available",
         image: "SS", // Placeholder for initial
         patients: 1240,
         experience: "8 Years",
         color: "bg-blue-100 text-blue-600"
      },
      {
         id: 2,
         name: "Dr. James Wilson",
         specialty: "Dentistry Specialist",
         status: "On Leave",
         image: "JW",
         patients: 850,
         experience: "5 Years",
         color: "bg-purple-100 text-purple-600"
      },
      {
         id: 3,
         name: "Dr. Emily Chen",
         specialty: "Exotic Animals",
         status: "Busy",
         image: "EC",
         patients: 2100,
         experience: "12 Years",
         color: "bg-green-100 text-green-600"
      },
      {
         id: 4,
         name: "Dr. Michael Ross",
         specialty: "Cardiologist",
         status: "Available",
         image: "MR",
         patients: 1500,
         experience: "15 Years",
         color: "bg-orange-100 text-orange-600"
      }
   ];

   return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
               <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Veterinary Team</h1>
               <p className="text-gray-500 mt-1">Manage your team of experts and specialists.</p>
            </div>
            <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-800 transition-all text-sm flex items-center gap-2">
               <Plus size={16} /> Add Veterinarian
            </button>

         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {vets.map((vet) => (
               <div key={vet.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-6">
                     <div className={`w-16 h-16 rounded-2xl ${vet.color} flex items-center justify-center text-xl font-bold`}>
                        {vet.image}
                     </div>
                     <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${vet.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' :
                        vet.status === 'On Leave' ? 'bg-gray-50 text-gray-500 border-gray-100' :
                           'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {vet.status}
                     </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{vet.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-4">{vet.specialty}</p>

                  <div className="flex items-center gap-4 py-4 border-t border-gray-50">
                     <div>
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Patients</div>
                        <div className="font-bold text-gray-800">{vet.patients}</div>
                     </div>
                     <div className="w-px h-8 bg-gray-100"></div>
                     <div>
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Experience</div>
                        <div className="font-bold text-gray-800">{vet.experience}</div>
                     </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                     <button className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        View Profile
                     </button>
                     <button className="px-3 py-2 text-gray-400 hover:text-primary bg-white border border-gray-200 rounded-lg hover:border-blue-200 transition-colors" title="Edit">
                        <Pencil size={20} />
                     </button>
                     <button className="px-3 py-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded-lg hover:border-red-200 transition-colors" title="Delete">
                        <Trash2 size={20} />
                     </button>

                  </div>
               </div>
            ))}

            {/* Add New Placeholder Card */}
            <button className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-primary/50 hover:bg-blue-50/30 hover:text-primary transition-all min-h-[280px] group">
               <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Plus size={32} />
               </div>

               <span className="font-semibold">Add New Specialist</span>
            </button>
         </div>
      </div>
   );
}
