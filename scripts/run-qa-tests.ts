import fs from 'node:fs';
import path from 'node:path';
import { getStoredFoundationSettings, updateStoredFoundationSettings } from '../lib/services/cms-store';
import { getFoundationSettings } from '../lib/data/public-repository';
import { getAdminDashboardData } from '../lib/data/admin-repository';
import { createApplicantAccount, verifyApplicantCredentials, getApplicantById, getApplicantAdmissions } from '../lib/auth/applicant-store';
import { createLocalAdmission, getLocalAdmissions, updateLocalAdmissionStatus } from '../lib/services/local-store';
import { verifyAdminCredentials } from '../lib/auth/admin-users';

async function runTests() {
  console.log('=== MEMULAI TEST 15 SKENARIO SISTEM LENGKAP ===\n');

  // -------------------------------------------------------------
  // TEST 1, 2, 3, 4: PENGATURAN YAYASAN (NOMOR HP) & SINKRONISASI
  // -------------------------------------------------------------
  console.log('[SKENARIO 1-4: Update Nomor HP & Sinkronisasi Publik]');
  const initialSettings = getStoredFoundationSettings();
  console.log('  1. Nomor HP saat ini:', initialSettings.phone);

  const testPhone = '0812-9988-7766';
  const updatedSettings = updateStoredFoundationSettings({ phone: testPhone });
  console.log('  2. Nomor HP berhasil diubah ke:', updatedSettings.phone);

  // Verifikasi file JSON permanen
  const settingsFile = path.join(process.cwd(), 'data', 'foundation-settings.json');
  const fileContent = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  if (fileContent.phone !== testPhone) {
    throw new Error('FAIL: Data di disk tidak cocok dengan perubahan!');
  }
  console.log('  3. Data di disk (foundation-settings.json) terbukti tersimpan permanen:', fileContent.phone);

  // Verifikasi pembacaan dari public repository
  const publicSettings = await getFoundationSettings();
  if (publicSettings.phone !== testPhone) {
    throw new Error('FAIL: Halaman publik tidak membaca nomor HP baru!');
  }
  console.log('  4. Halaman publik (getFoundationSettings) membaca data terbaru:', publicSettings.phone);

  // Verifikasi dashboard admin membaca nomor HP baru
  const adminProfile = verifyAdminCredentials('ketuayayasan', 'KetuaYayasan2027!');
  if (!adminProfile) throw new Error('FAIL: Login ketua yayasan gagal!');
  const adminData = await getAdminDashboardData(adminProfile);
  if (adminData.foundation?.phone !== testPhone) {
    throw new Error('FAIL: Dashboard admin tidak menampilkan nomor HP baru!');
  }
  console.log('  5. Dashboard admin setelah relogin membaca nomor HP baru:', adminData.foundation?.phone);
  console.log('  -> SKENARIO 1-4: BERHASIL (PASSED)\n');

  // -------------------------------------------------------------
  // TEST 5, 6: BUAT AKUN PENGGUNA BARU & LOGIN
  // -------------------------------------------------------------
  console.log('[SKENARIO 5-6: Buat Akun Wali Santri Baru & Login]');
  const testPhoneUser = '089911223344';
  const testPassword = 'PasswordWali2027!';
  const testFullName = 'Bapak Hendra Gunawan';

  // Bersihkan data lama jika ada
  const applicantsFile = path.join(process.cwd(), 'data', 'applicants.json');
  let currentApplicants = JSON.parse(fs.readFileSync(applicantsFile, 'utf8'));
  currentApplicants = currentApplicants.filter((a: any) => a.phone !== testPhoneUser);
  fs.writeFileSync(applicantsFile, JSON.stringify(currentApplicants, null, 2), 'utf8');

  const regResult = createApplicantAccount({
    full_name: testFullName,
    phone: testPhoneUser,
    email: 'hendra.gunawan@test.com',
    password: testPassword,
  });

  if (!regResult.success || !regResult.account) {
    throw new Error(`FAIL: Registrasi gagal: ${regResult.error}`);
  }
  console.log('  6. Akun berhasil dibuat dengan ID:', regResult.account.id);

  const loginResult = verifyApplicantCredentials(testPhoneUser, testPassword);
  if (!loginResult || loginResult.id !== regResult.account.id) {
    throw new Error('FAIL: Login dengan kredensial baru gagal!');
  }
  console.log('  7. Login berhasil untuk:', loginResult.full_name);
  console.log('  -> SKENARIO 5-6: BERHASIL (PASSED)\n');

  // -------------------------------------------------------------
  // TEST 7, 8: ISI FORMULIR PPDB & KIRIM (NOMOR REGISTRASI UNIK)
  // -------------------------------------------------------------
  console.log('[SKENARIO 7-8: Isi Formulir PPDB & Nomor Registrasi Unik]');
  const newAdmission = createLocalAdmission({
    user_id: loginResult.id,
    unit_id: 'unit-smp-001',
    academic_year_id: 'ay-2027-2028',
    period_id: 'period-smp-g1',
    unitCode: 'SMP',
    status: 'menunggu_verifikasi',
    verification_notes: null,
    statement_agreed: true,
    submitted_at: new Date().toISOString(),
    unit: {
      id: 'unit-smp-001',
      slug: 'smp',
      unit_code: 'SMP',
      name: 'SMP Muhammad Tahir',
      logo_url: '/logos/logo-smp.png',
    },
    academic_year: {
      id: 'ay-2027-2028',
      name: '2027/2028',
    },
    period: {
      id: 'period-smp-g1',
      name: 'Gelombang 1 Reguler',
    },
    applicant: {
      id: `app-${Date.now()}`,
      full_name: 'Muhammad Farhan Gunawan',
      gender: 'L',
      birth_place: 'Garut',
      birth_date: '2014-05-12',
      address: 'Jl. Merdeka No. 45, Garut',
      previous_school: 'SDN 1 Garut Kota',
    },
    guardian: {
      id: `grd-${Date.now()}`,
      father_name: 'Hendra Gunawan',
      mother_name: 'Rina Marlina',
      guardian_name: null,
      phone: testPhoneUser,
      email: 'hendra.gunawan@test.com',
      parent_address: 'Jl. Merdeka No. 45, Garut',
    },
    documents: [],
    status_logs: [
      {
        id: `log-${Date.now()}`,
        admission_id: `adm-${Date.now()}`,
        previous_status: null,
        new_status: 'menunggu_verifikasi',
        notes: 'Formulir pendaftaran daring dikirim oleh wali murid.',
        created_at: new Date().toISOString(),
      },
    ],
  });

  console.log('  8. Pendaftaran tersimpan dengan Nomor Registrasi:', newAdmission.registration_number);
  if (!newAdmission.registration_number.startsWith('MT-SMP-2027-')) {
    throw new Error('FAIL: Format nomor registrasi tidak valid!');
  }
  console.log('  -> SKENARIO 7-8: BERHASIL (PASSED)\n');

  // -------------------------------------------------------------
  // TEST 9, 10: LOGOUT & LOGIN KEMBALI SEBAGAI PENGGUNA -> CEK RIWAYAT
  // -------------------------------------------------------------
  console.log('[SKENARIO 9-10: Cek Riwayat Pendaftaran Akun Pengguna]');
  const reVerifyUser = verifyApplicantCredentials('hendra.gunawan@test.com', testPassword);
  if (!reVerifyUser) throw new Error('FAIL: Login ulang gagal!');

  const userAdmissions = getApplicantAdmissions(reVerifyUser);
  console.log(`  9. Jumlah pendaftaran milik ${reVerifyUser.full_name}: ${userAdmissions.length}`);
  const myAdmission = userAdmissions.find((a) => a.id === newAdmission.id);
  if (!myAdmission) throw new Error('FAIL: Pendaftaran yang baru dibuat tidak ditemukan di riwayat akun!');

  console.log('  10. Ditemukan pendaftaran:', {
    regNumber: myAdmission.registration_number,
    childName: myAdmission.applicant?.full_name,
    unit: myAdmission.unit?.name,
    status: myAdmission.status,
  });
  console.log('  -> SKENARIO 9-10: BERHASIL (PASSED)\n');

  // -------------------------------------------------------------
  // TEST 11, 12: ADMIN VERIFIKASI & CATATAN
  // -------------------------------------------------------------
  console.log('[SKENARIO 11-12: Admin Memeriksa & Mengubah Status Verifikasi]');
  const panitiaAuth = verifyAdminCredentials('panitiappdb', 'PanitiaPPDB2027!');
  if (!panitiaAuth) throw new Error('FAIL: Login panitia PPDB gagal!');

  const updatedByAdmin = updateLocalAdmissionStatus(
    newAdmission.id,
    'diterima',
    'Berkas pendaftaran telah diverifikasi dan dinyatakan DITERIMA.',
    panitiaAuth.full_name
  );

  if (!updatedByAdmin || updatedByAdmin.status !== 'diterima') {
    throw new Error('FAIL: Status pendaftaran gagal diperbarui oleh admin!');
  }
  console.log('  11. Status berhasil diperbarui oleh panitia menjadi:', updatedByAdmin.status);
  console.log('  12. Catatan panitia:', updatedByAdmin.verification_notes);
  console.log('  -> SKENARIO 11-12: BERHASIL (PASSED)\n');

  // -------------------------------------------------------------
  // TEST 13, 14: PENGGUNA MELIHAT STATUS TERBARU & CATATAN
  // -------------------------------------------------------------
  console.log('[SKENARIO 13-14: Pengguna Melihat Perubahan Status]');
  const refreshedUserAdmissions = getApplicantAdmissions(reVerifyUser);
  const myUpdatedAdmission = refreshedUserAdmissions.find((a) => a.id === newAdmission.id);
  if (!myUpdatedAdmission || myUpdatedAdmission.status !== 'diterima') {
    throw new Error('FAIL: Pengguna tidak melihat status terbaru!');
  }
  console.log('  13. Pengguna berhasil melihat status terbaru:', myUpdatedAdmission.status);
  console.log('  14. Pengguna berhasil melihat catatan panitia:', myUpdatedAdmission.verification_notes);
  console.log('  15. Linimasa riwayat status_logs:', myUpdatedAdmission.status_logs?.length, 'entri tercatat');
  console.log('  -> SKENARIO 13-14: BERHASIL (PASSED)\n');

  // -------------------------------------------------------------
  // TEST 15: ISOLASI DATA (PENGGUNA LAIN TIDAK BISA MELIHAT DATA INI)
  // -------------------------------------------------------------
  console.log('[SKENARIO 15: Isolasi Hak Akses Data Antara Pengguna]');
  // Akun orang lain: Ahmad Fauzi
  const otherApplicant = getApplicantById('app-user-001');
  if (!otherApplicant) throw new Error('FAIL: Akun app-user-001 tidak ditemukan!');

  const otherAdmissions = getApplicantAdmissions(otherApplicant);
  const leakedAdmission = otherAdmissions.find((a) => a.id === newAdmission.id);
  if (leakedAdmission) {
    throw new Error('CRITICAL BUG: Pengguna lain dapat melihat data pendaftaran bukan miliknya!');
  }
  console.log('  16. Terverifikasi: Akun lain (Ahmad Fauzi) TIDAK DAPAT mengakses data pendaftaran milik Hendra Gunawan.');
  console.log('  -> SKENARIO 15: BERHASIL (PASSED)\n');

  console.log('=====================================================');
  console.log('🎉 SEMUA 15 SKENARIO PENGUJIAN TELAH LULUS 100%! 🎉');
  console.log('=====================================================');
}

runTests().catch((err) => {
  console.error('ERROR SAAT TESTING:', err);
  process.exit(1);
});
