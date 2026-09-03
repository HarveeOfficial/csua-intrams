<?php

namespace Database\Seeders;

use App\Models\College;
use Illuminate\Database\Seeder;

class CollegeSeeder extends Seeder
{
    /**
     * Seed the participating colleges.
     */
    public function run(): void
    {
        $colleges = [
            'CICS' => [
                'name' => 'College of Information and Computing Sciences',
                'color' => '#F57C00',
            ],
            'CFAS' => [
                'name' => 'College of Fisheries and Aquatic Science',
                'color' => '#4FC3F7',
            ],
            'CTED' => [
                'name' => 'College of Teacher Education',
                'color' => '#1976D2',
            ],
            'CBEA' => [
                'name' => 'College of Business Entrepreneurship and Accountancy',
                'color' => '#00897B',
            ],
            'CIT' => [
                'name' => 'College of Industrial Technology',
                'color' => '#0D47A1',
            ],
            'CCJE' => [
                'name' => 'College of Criminal Justice Education',
                'color' => '#C62828',
            ],
            'CHM' => [
                'name' => 'College of Hospitality Management',
                'color' => '#EC407A',
            ],
        ];

        foreach ($colleges as $code => $college) {
            College::query()->updateOrCreate(
                ['code' => $code],
                $college
            );
        }
    }
}