// ===== Mengambil elemen HTML =====
let layarNode = document.getElementById("layar");
let ekspresiNode = document.getElementById("ekspresi");
let daftarRiwayatNode = document.getElementById("daftarRiwayat");
let hapusRiwayatNode = document.getElementById("hapusRiwayat");
let semuaTombol = document.querySelectorAll(".tombol");

// ===== Variabel untuk menyimpan data =====
let angkaSekarang = "0";   // angka yang sedang diketik (string)
let angkaSebelumnya = null; // angka pertama sebelum operator
let operatorAktif = null;   // + - * /
let resetLayar = false;     // true kalau angka berikutnya harus mulai dari awal
let adaError = false;
let riwayat = [];           // array untuk menyimpan riwayat

// Simbol operator untuk ditampilkan di layar
const SIMBOL = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
};

// ===== Function untuk menghitung =====
const hitung = (a, b, operator) => {
    let hasil;

    switch (operator) {
        case "+":
            hasil = a + b;
            break;
        case "-":
            hasil = a - b;
            break;
        case "*":
            hasil = a * b;
            break;
        case "/":
            if (b === 0) {
                return null; // tidak bisa dibagi nol
            }
            hasil = a / b;
            break;
        default:
            hasil = b;
    }

    // Supaya 0.1 + 0.2 hasilnya 0.3 (bukan 0.30000000000000004)
    return parseFloat(hasil.toPrecision(12));
};

// ===== Function untuk menampilkan ke layar =====
const tampilkan = () => {
    layarNode.innerHTML = angkaSekarang;

    // Kalau angka terlalu panjang, kecilkan ukuran font
    if (angkaSekarang.length > 11) {
        layarNode.classList.add("kecil");
    } else {
        layarNode.classList.remove("kecil");
    }

    // Tampilkan angka pertama dan operator di baris atas
    if (operatorAktif !== null) {
        ekspresiNode.innerHTML = angkaSebelumnya + " " + SIMBOL[operatorAktif];
    }
};

const tampilkanError = (pesan) => {
    adaError = true;
    layarNode.innerHTML = "Error";
    layarNode.classList.add("error");
    ekspresiNode.innerHTML = pesan;
};

const hapusError = () => {
    adaError = false;
    layarNode.classList.remove("error");
};

// ===== Function untuk tombol angka =====
const inputAngka = (angka) => {
    if (adaError) {
        hapusSemua();
    }

    if (resetLayar || angkaSekarang === "0") {
        angkaSekarang = angka;
        resetLayar = false;
    } else if (angkaSekarang.length < 15) {
        angkaSekarang = angkaSekarang + angka;
    }
    tampilkan();
};

const inputTitik = () => {
    if (adaError) {
        hapusSemua();
    }

    if (resetLayar) {
        angkaSekarang = "0";
        resetLayar = false;
    }

    // Titik hanya boleh satu kali
    if (!angkaSekarang.includes(".")) {
        angkaSekarang = angkaSekarang + ".";
    }
    tampilkan();
};

// ===== Function untuk tombol operator =====
const pilihOperator = (operator) => {
    if (adaError) {
        return;
    }

    // Kalau sudah ada operator dan angka kedua sudah diketik, hitung dulu
    if (operatorAktif !== null && !resetLayar) {
        let hasil = hitung(angkaSebelumnya, parseFloat(angkaSekarang), operatorAktif);

        if (hasil === null) {
            tampilkanError("Tidak bisa dibagi dengan 0");
            return;
        }
        angkaSebelumnya = hasil;
        angkaSekarang = String(hasil);
    } else {
        angkaSebelumnya = parseFloat(angkaSekarang);
    }

    operatorAktif = operator;
    resetLayar = true;
    tampilkan();
    tandaiOperator();
};

// ===== Function untuk tombol sama dengan =====
const sama = () => {
    if (adaError || operatorAktif === null) {
        return;
    }

    let a = angkaSebelumnya;
    let b = parseFloat(angkaSekarang);
    let hasil = hitung(a, b, operatorAktif);

    if (hasil === null) {
        tampilkanError("Tidak bisa dibagi dengan 0");
        angkaSekarang = "0";
        angkaSebelumnya = null;
        operatorAktif = null;
        tandaiOperator();
        return;
    }

    let teksRiwayat = `${a} ${SIMBOL[operatorAktif]} ${b}`;
    ekspresiNode.innerHTML = teksRiwayat + " =";
    tambahRiwayat(teksRiwayat, hasil);

    angkaSekarang = String(hasil);
    angkaSebelumnya = null;
    operatorAktif = null;
    resetLayar = true;
    tampilkan();
    tandaiOperator();
};

// ===== Function untuk tombol fungsi lain =====
const hapusSemua = () => {
    angkaSekarang = "0";
    angkaSebelumnya = null;
    operatorAktif = null;
    resetLayar = false;
    hapusError();
    ekspresiNode.innerHTML = "&nbsp;";
    tampilkan();
    tandaiOperator();
};

const hapusSatu = () => {
    if (adaError) {
        hapusSemua();
        return;
    }
    if (resetLayar) {
        return;
    }

    // Hapus satu karakter paling belakang
    angkaSekarang = angkaSekarang.slice(0, -1);
    if (angkaSekarang === "" || angkaSekarang === "-") {
        angkaSekarang = "0";
    }
    tampilkan();
};

const ubahTanda = () => {
    if (adaError || angkaSekarang === "0") {
        return;
    }

    if (angkaSekarang.startsWith("-")) {
        angkaSekarang = angkaSekarang.slice(1);
    } else {
        angkaSekarang = "-" + angkaSekarang;
    }
    tampilkan();
};

const persen = () => {
    if (adaError) {
        return;
    }

    let nilai = parseFloat(angkaSekarang) / 100;
    angkaSekarang = String(parseFloat(nilai.toPrecision(12)));
    tampilkan();
};

// ===== Function untuk riwayat =====
const tambahRiwayat = (teks, hasil) => {
    // data terbaru ditaruh paling depan
    riwayat = [{ teks: teks, hasil: hasil }, ...riwayat];

    // Maksimal 10 riwayat
    if (riwayat.length > 10) {
        riwayat.pop();
    }
    tampilkanRiwayat();
};

const tampilkanRiwayat = () => {
    daftarRiwayatNode.innerHTML = "";

    if (riwayat.length === 0) {
        daftarRiwayatNode.innerHTML = '<li class="kosong">Belum ada perhitungan</li>';
        return;
    }

    for (let item of riwayat) {
        let li = document.createElement("li");
        li.innerHTML = `<small>${item.teks} =</small><strong>${item.hasil}</strong>`;
        daftarRiwayatNode.appendChild(li);
    }
};

const hapusRiwayat = () => {
    riwayat = [];
    tampilkanRiwayat();
};

// Menandai tombol operator yang sedang dipilih
const tandaiOperator = () => {
    semuaTombol.forEach((tombol) => {
        let aktif = tombol.dataset.tipe === "operator" && tombol.dataset.nilai === operatorAktif && resetLayar;
        if (aktif) {
            tombol.classList.add("aktif");
        } else {
            tombol.classList.remove("aktif");
        }
    });
};

// ===== Event Listener tombol =====
semuaTombol.forEach((tombol) => {
    tombol.addEventListener("click", () => {
        let tipe = tombol.dataset.tipe;
        let nilai = tombol.dataset.nilai;

        switch (tipe) {
            case "angka":
                inputAngka(nilai);
                break;
            case "titik":
                inputTitik();
                break;
            case "operator":
                pilihOperator(nilai);
                break;
            case "sama":
                sama();
                break;
            case "hapus-semua":
                hapusSemua();
                break;
            case "hapus-satu":
                hapusSatu();
                break;
            case "ubah-tanda":
                ubahTanda();
                break;
            case "persen":
                persen();
                break;
        }
    });
});

hapusRiwayatNode.addEventListener("click", hapusRiwayat);

// ===== Event Listener keyboard =====
document.addEventListener("keydown", (e) => {
    let tombol = e.key;

    if (tombol >= "0" && tombol <= "9") {
        inputAngka(tombol);
    } else if (tombol === "." || tombol === ",") {
        inputTitik();
    } else if (tombol === "+" || tombol === "-" || tombol === "*" || tombol === "/") {
        e.preventDefault(); // supaya "/" tidak membuka quick find di browser
        pilihOperator(tombol);
    } else if (tombol === "Enter" || tombol === "=") {
        e.preventDefault();
        sama();
    } else if (tombol === "Backspace") {
        hapusSatu();
    } else if (tombol === "Escape" || tombol === "Delete") {
        hapusSemua();
    } else if (tombol === "%") {
        persen();
    }
});

// Tampilan awal
tampilkan();
