import React from "react";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import ProfileViewer from "../components/ProfileViewer.jsx";

const ComprehensiveMedicalProfile = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 min-h-full">
      <div className="py-6">
        <div className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-2xl mb-8 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <HiOutlineClipboardDocumentList className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">
                Comprehensive Medical Profile
              </h1>
            </div>
            <p className="text-blue-100 font-medium">
              Complete patient health overview with medical records, vitals,
              lifestyle, and consultation history
            </p>
          </div>
        </div>
        <ProfileViewer />
      </div>
    </div>
  );
};

export default ComprehensiveMedicalProfile;
