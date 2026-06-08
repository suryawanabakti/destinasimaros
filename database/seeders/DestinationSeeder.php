<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $destinations = [
            [
                'name' => 'Taman Nasional Bantimurung',
                'description' => 'Terkenal sebagai "The Kingdom of Butterfly", taman nasional ini menawarkan keindahan air terjun yang ikonik, gua-gua prasejarah, dan keanekaragaman kupu-kupu yang luar biasa. Sangat cocok untuk wisata keluarga dan pecinta alam.',
                'location' => 'Kecamatan Bantimurung, Maros',
                'image_url' => 'https://images.unsplash.com/photo-1596401057633-5310bad5a9e6?auto=format&fit=crop&q=80&w=800',
                'category' => 'Alam & Konservasi',
                'latitude' => -5.010583,
                'longitude' => 119.663139,
            ],
            [
                'name' => 'Rammang-Rammang',
                'description' => 'Kawasan karst terluas kedua di dunia. Menawarkan pemandangan pegunungan kapur yang megah, sungai yang tenang dengan perahu tradisional, serta hamparan sawah hijau yang memukau. Suasananya sangat tenang dan asri.',
                'location' => 'Desa Salenrang, Bontoa, Maros',
                'image_url' => 'https://images.unsplash.com/photo-1624535492451-93041c2c2f60?auto=format&fit=crop&q=80&w=800',
                'category' => 'Pegunungan & Karst',
                'latitude' => -4.906389,
                'longitude' => 119.555278,
            ],
            [
                'name' => 'Air Terjun Lacolla',
                'description' => 'Air terjun bertingkat yang tersembunyi dengan debit air yang kuat dan kolam alami di bawahnya. Dikelilingi oleh tebing bebatuan yang eksotis, memberikan kesan petualangan yang mendalam.',
                'location' => 'Desa Cenrana Baru, Cenrana, Maros',
                'image_url' => 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800',
                'category' => 'Air Terjun',
                'latitude' => -4.956667,
                'longitude' => 119.631667,
            ],
            [
                'name' => 'Leang-Leang Prehistoric Park',
                'description' => 'Situs prasejarah yang menampilkan jejak tangan manusia purba dan lukisan babi rusa di dinding gua. Terletak di tengah formasi batu karst yang unik dan artistik.',
                'location' => 'Kelurahan Leang-Leang, Bantimurung, Maros',
                'image_url' => 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
                'category' => 'Sejarah & Budaya',
                'latitude' => -5.002639,
                'longitude' => 119.650500,
            ],
            [
                'name' => 'Grand Mall Maros',
                'description' => 'Pusat perbelanjaan modern di Maros yang menyediakan berbagai fasilitas hiburan, bioskop, dan kuliner. Cocok untuk bersantai di akhir pekan bersama teman atau keluarga.',
                'location' => 'Jl. Poros Makassar - Maros',
                'image_url' => 'https://images.unsplash.com/photo-1567449303078-57ad995bd3a1?auto=format&fit=crop&q=80&w=800',
                'category' => 'Modern & Belanja',
                'latitude' => -5.005556,
                'longitude' => 119.574444,
            ],
            [
                'name' => 'Wisata Pattunuang',
                'description' => 'Menyajikan panorama pegunungan karst dan sungai yang mengalir jernih. Area ini sangat populer untuk kegiatan berkemah (camping) dan rock climbing.',
                'location' => 'Desa Samangki, Simbang, Maros',
                'image_url' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800',
                'category' => 'Petualangan',
                'latitude' => -5.020833,
                'longitude' => 119.680556,
            ],
            [
                'name' => 'Air Terjun Lengang',
                'description' => 'Air terjun yang menawarkan suasana tenang dan air yang sangat jernih. Masih sangat alami dan belum banyak tersentuh, cocok untuk yang mencari ketenangan.',
                'location' => 'Kecamatan Mallawa, Maros',
                'image_url' => 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
                'category' => 'Air Terjun',
                'latitude' => -5.027222,
                'longitude' => 119.895833,
            ],
        ];

        foreach ($destinations as $destination) {
            \App\Models\Destination::create($destination);
        }
    }
}
