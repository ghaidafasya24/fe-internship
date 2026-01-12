// Template baris tabel kategori (diganti placeholder dengan data kategori)
export let iniTabelKategori =
  `  <tr data-row-id="#ID#" data-nama="#Nama_Kategori#" data-deskripsi="#Deskripsi#" class="hover:bg-gray-50/50 ease-soft">
                <td class="px-6 py-4 text-center text-sm font-semibold text-primary/90">#No#</td>
                <td class="px-6 py-4 text-left text-sm font-medium text-primary">#Nama_Kategori#</td>
                <td class="px-6 py-4 text-left text-sm text-primary/70">#Deskripsi#</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button data-id="#ID#" class="btn-edit inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg shadow-sm ease-soft">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button data-id="#ID#" class="btn-delete inline-flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm ease-soft">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            `