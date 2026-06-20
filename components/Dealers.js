"use client";
import styles from "./Dealers.module.css";

const dealers = [
  { name: "Ahamed", location: "Thondi, Ramanathapuram", initial: "A" },
  { name: "Rathina", location: "Tenkasi", initial: "R" },
  { name: "Jaganraj", location: "Attur", initial: "J" },
  { name: "Sarbudeen", location: "Trichy Central", initial: "S" },
  { name: "Sevagan", location: "Thittakudi, Cuddalore", initial: "S" },
  { name: "Karthick C", location: "Hosur", initial: "K" },
  { name: "Saran", location: "Salem Division 1", initial: "S" },
  { name: "Lawrence", location: "Taramani, Chennai", initial: "L" },
  { name: "JK Yashwanth Raj", location: "Rajapalayam", initial: "Y" },
];

export default function Dealers() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.label}>🤝 NETWORK</span>
          <h2 className={styles.title}>Our Dealers</h2>
          <p className={styles.subtitle}>Trusted partners bringing quality devices to every corner</p>
        </div>
        <div className={styles.grid}>
          {dealers.map((d, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.avatar}>{d.initial}</div>
              <div className={styles.info}>
                <h4>{d.name}</h4>
                <p>{d.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
