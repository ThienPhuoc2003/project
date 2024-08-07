// Import React and necessary hooks
"use client"
import React, { useState, useEffect } from 'react';
import Layout from './layout';  // Ensure this imports correctly from your file structure


// Define the StatsPage component
const StatsPage = () => {
    // State to hold the total counts
    const [totalFiles, setTotalFiles] = useState(0);
    const [totalFavorites, setTotalFavorites] = useState(0);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
               // const filesCount = await convex.getTotalFiles(); // Make sure to adapt this to your actual API
              //  const favoritesCount = await convex.getTotalFavorites(); // Make sure to adapt this to your actual API
              //  setTotalFiles(filesCount);
              //  setTotalFavorites(favoritesCount);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Layout>
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">Thống Kê</h1>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 shadow rounded">
                        <h2 className="font-semibold text-lg">Tổng Số Đề Thi</h2>
                        <p className="text-xl">{totalFiles}</p>
                    </div>
                    <div className="bg-white p-4 shadow rounded">
                        <h2 className="font-semibold text-lg">Tổng Số Đề Được Yêu Thích</h2>
                        <p className="text-xl">{totalFavorites}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Export the StatsPage component
export default StatsPage;