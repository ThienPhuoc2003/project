import React from 'react';
import Layout from './layout';

const StatsPage = () => {
    return (
        <Layout>
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-6">Thống Kê</h1>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 shadow rounded">
                        <h2 className="font-semibold text-lg">Số Lượng Đề Thi</h2>
                        <p className="text-3xl">150</p>
                    </div>
                    <div className="bg-white p-4 shadow rounded">
                        <h2 className="font-semibold text-lg">Số Lượng Câu Hỏi</h2>
                        <p className="text-3xl">3000</p>
                    </div>
                    <div className="bg-white p-4 shadow rounded">
                        <h2 className="font-semibold text-lg">Số Lượng Sinh Viên Đã Tham Gia</h2>
                        <p className="text-3xl">1200</p>
                    </div>
                    {/* Thêm các widget thống kê khác ở đây */}
                </div>
            </div>
        </Layout>
    );
};

export default StatsPage;