// Seed data for the existing development RidePicker account (+37067837730).
// Isolated so it can be replaced/supplemented independently of the store logic.
//
// This account models an ESTABLISHED returning customer: ~3 months of history,
// an active Premium subscription, WhatsApp connected, RidePicker in Assist mode,
// 20 realistic chauffeur jobs across the full status lifecycle, realistic
// payments, expenses, billing invoices and a rich activity feed.
//
// New (non-dev) phone numbers start empty — see buildNewUser() in mockDataStore.

export const DEV_PHONE = "+37067837730";
export const DEV_ID = "usr_dominykas";

const PLAN = { name: "RidePicker Premium", price: 180, currency: "EUR", interval: "month" };
const MOCK_WA_PHONE = "+44 7700 900456";
const MOCK_CARD = { type: "card", brand: "Visa", last4: "4242", expMonth: 12, expYear: 2028 };

const addMonths = (date, n) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
};
const invId = (d) => `INV-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-001`;
const agoMin = (ref, m) => new Date(ref - m * 60000).toISOString();
const inDays = (ref, days, h, mm) => {
  const d = new Date(ref);
  d.setDate(d.getDate() + days);
  d.setHours(h, mm, 0, 0);
  return d.toISOString();
};
const tl = (steps) => steps.map(([label, time]) => ({ label, time, done: !!time }));

// payment helpers — currency is GBP on every job (London chauffeur work).
const GBP = "GBP";
const unpaid = (method = null, expenses = []) => ({ paymentStatus: "unpaid", paymentMethod: method, expenses });
const paid = (method, expenses = []) => ({ paymentStatus: "paid", paymentMethod: method, expenses });
const noPay = { paymentStatus: null, paymentMethod: null, expenses: [] };

export function buildJobs(ref) {
  return [
    // --- Active pipeline (today) ---
    {
      id: "j1",
      pickup: "LHR Terminal 2",
      dropoff: "Mayfair, London",
      pickupTime: inDays(ref, 0, 10, 30),
      price: 95,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 2,
      flightNumber: "BA123",
      source: "London Chauffeur Jobs",
      sender: "John M.",
      status: "new",
      detectedAt: agoMin(ref, 4),
      originalMessage:
        "Job: LHR T2 → Mayfair. Today 10:30. £95. Need E-Class, 2 pax. BA123 lands 10:10. DM if available 🚗",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 4)],
        ["Sender contacted", null],
        ["Offer sent", null],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j8",
      pickup: "Gatwick North",
      dropoff: "Central London",
      pickupTime: inDays(ref, 0, 16, 20),
      price: 110,
      currency: GBP,
      vehicle: "V-Class",
      passengers: 6,
      flightNumber: null,
      source: "Sussex Chauffeurs",
      sender: null,
      status: "new",
      detectedAt: agoMin(ref, 8),
      originalMessage: "Gatwick North → Central London 16:20. 6 pax, need V-Class. £110.",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 8)],
        ["Sender contacted", null],
        ["Offer sent", null],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j2",
      pickup: "Gatwick Airport",
      dropoff: "Brighton",
      pickupTime: inDays(ref, 0, 14, 0),
      price: 120,
      currency: GBP,
      vehicle: "V-Class",
      passengers: 4,
      flightNumber: null,
      source: "Sussex Chauffeurs",
      sender: "Sarah K.",
      status: "interested",
      detectedAt: agoMin(ref, 22),
      originalMessage:
        "Anyone free for Gatwick → Brighton at 14:00? 4 passengers, need V-Class. £120. ✋",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 22)],
        ["Sender contacted", agoMin(ref, 20)],
        ["Offer sent", agoMin(ref, 18)],
        ["Reply received", agoMin(ref, 12)],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j18",
      pickup: "LHR Terminal 5",
      dropoff: "Southampton",
      pickupTime: inDays(ref, 1, 10, 0),
      price: null,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 2,
      flightNumber: null,
      source: "Heathrow Transfers",
      sender: "David R.",
      status: "interested",
      detectedAt: agoMin(ref, 30),
      originalMessage: "LHR T5 → Southampton tomorrow 10:00. 2 pax. Price TBC, what can you do?",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 30)],
        ["Sender contacted", agoMin(ref, 28)],
        ["Offer sent", null],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j3",
      pickup: "Stansted Airport",
      dropoff: "Cambridge",
      pickupTime: inDays(ref, 1, 8, 15),
      price: 85,
      currency: GBP,
      vehicle: "E-Class",
      passengers: null,
      flightNumber: null,
      source: "London Airport Runs",
      sender: "Mike T.",
      status: "contacted",
      detectedAt: agoMin(ref, 50),
      originalMessage:
        "Stansted → Cambridge tomorrow 08:15. £85. E-Class preferred. Who can take it?",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 50)],
        ["Sender contacted", agoMin(ref, 48)],
        ["Offer sent", null],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j9",
      pickup: "Stansted Airport",
      dropoff: "Liverpool Street",
      pickupTime: inDays(ref, 0, 7, 45),
      price: 55,
      currency: GBP,
      vehicle: "E-Class",
      passengers: null,
      flightNumber: null,
      source: "London Airport Runs",
      sender: "Alex P.",
      status: "contacted",
      detectedAt: agoMin(ref, 300),
      originalMessage: "Stansted → Liverpool St 07:45. £55. E-Class.",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 300)],
        ["Sender contacted", agoMin(ref, 298)],
        ["Offer sent", null],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j4",
      pickup: "LHR Terminal 5",
      dropoff: "Oxford",
      pickupTime: inDays(ref, 0, 18, 45),
      price: 140,
      currency: GBP,
      vehicle: "S-Class",
      passengers: 2,
      flightNumber: "BA456",
      source: "Heathrow Transfers",
      sender: "David R.",
      status: "negotiating",
      detectedAt: agoMin(ref, 90),
      originalMessage:
        "LHR T5 → Oxford 18:45 today. 2 pax, BA456. Need S-Class. Asking £140, can you do £130?",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 90)],
        ["Sender contacted", agoMin(ref, 88)],
        ["Offer sent", agoMin(ref, 85)],
        ["Reply received", agoMin(ref, 60)],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j10",
      pickup: "LHR Terminal 2",
      dropoff: "Bath",
      pickupTime: inDays(ref, 1, 9, 0),
      price: 180,
      currency: GBP,
      vehicle: "S-Class",
      passengers: 3,
      flightNumber: "BA789",
      source: "Heathrow Transfers",
      sender: "David R.",
      status: "interested",
      detectedAt: agoMin(ref, 320),
      originalMessage:
        "LHR T2 → Bath tomorrow 09:00. 3 pax, BA789. S-Class required. £180. Available?",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 320)],
        ["Sender contacted", agoMin(ref, 318)],
        ["Offer sent", agoMin(ref, 315)],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j7",
      pickup: "LHR Terminal 3",
      dropoff: "Windsor",
      pickupTime: inDays(ref, 0, 13, 0),
      price: 60,
      currency: GBP,
      vehicle: "E-Class",
      passengers: null,
      flightNumber: null,
      source: "London Chauffeur Jobs",
      sender: null,
      status: "ignored",
      detectedAt: agoMin(ref, 240),
      originalMessage: "Heathrow T3 → Windsor 13:00 £60 anyone?",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 240)],
        ["Sender contacted", null],
        ["Offer sent", null],
        ["Reply received", null],
        ["Job confirmed", null],
      ]),
    },
    {
      id: "j6",
      pickup: "Luton Airport",
      dropoff: "Milton Keynes",
      pickupTime: inDays(ref, 1, 11, 30),
      price: 70,
      currency: GBP,
      vehicle: "E-Class",
      passengers: null,
      flightNumber: null,
      source: "Airport Jobs UK",
      sender: "Tom B.",
      status: "lost",
      detectedAt: agoMin(ref, 200),
      originalMessage:
        "Luton → Milton Keynes tomorrow 11:30. £70. Taken by another driver, thanks.",
      ...noPay,
      timeline: tl([
        ["Job detected", agoMin(ref, 200)],
        ["Sender contacted", agoMin(ref, 198)],
        ["Offer sent", agoMin(ref, 196)],
        ["Reply received", agoMin(ref, 120)],
        ["Job confirmed", null],
      ]),
    },

    // --- Upcoming won jobs (Unpaid) ---
    {
      id: "j12",
      pickup: "Luton Airport",
      dropoff: "Cambridge",
      pickupTime: inDays(ref, 1, 6, 30),
      price: 90,
      currency: GBP,
      vehicle: "E-Class",
      passengers: null,
      flightNumber: null,
      source: "Airport Jobs UK",
      sender: null,
      status: "won",
      detectedAt: agoMin(ref, 12),
      originalMessage: "Luton → Cambridge tomorrow 06:30. £90. E-Class.",
      ...unpaid(null, []),
      timeline: tl([
        ["Job detected", agoMin(ref, 12)],
        ["Sender contacted", agoMin(ref, 10)],
        ["Offer sent", agoMin(ref, 8)],
        ["Reply received", agoMin(ref, 6)],
        ["Job confirmed", agoMin(ref, 4)],
      ]),
    },
    {
      id: "j5",
      pickup: "London City Airport",
      dropoff: "Canary Wharf",
      pickupTime: inDays(ref, 0, 9, 0),
      price: 45,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 1,
      flightNumber: null,
      source: "London Chauffeur Jobs",
      sender: "Emma L.",
      status: "won",
      detectedAt: agoMin(ref, 180),
      originalMessage: "London City → Canary Wharf 09:00. 1 pax. £45. E-Class fine.",
      ...unpaid(null, []),
      timeline: tl([
        ["Job detected", agoMin(ref, 180)],
        ["Sender contacted", agoMin(ref, 178)],
        ["Offer sent", agoMin(ref, 176)],
        ["Reply received", agoMin(ref, 150)],
        ["Job confirmed", agoMin(ref, 140)],
      ]),
    },
    {
      id: "j11",
      pickup: "London City Airport",
      dropoff: "LHR Terminal 5",
      pickupTime: inDays(ref, 0, 15, 0),
      price: 75,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 2,
      flightNumber: null,
      source: "London Chauffeur Jobs",
      sender: "Emma L.",
      status: "won",
      detectedAt: agoMin(ref, 400),
      originalMessage: "City Airport → LHR T5 15:00. 2 pax. £75. E-Class.",
      ...unpaid(null, []),
      timeline: tl([
        ["Job detected", agoMin(ref, 400)],
        ["Sender contacted", agoMin(ref, 398)],
        ["Offer sent", agoMin(ref, 396)],
        ["Reply received", agoMin(ref, 370)],
        ["Job confirmed", agoMin(ref, 360)],
      ]),
    },

    // --- Completed won jobs: realistic payment + expense combinations ---
    // Completed + Paid + Card
    {
      id: "j13",
      pickup: "LHR Terminal 4",
      dropoff: "Reading",
      pickupTime: inDays(ref, -1, 11, 0),
      price: 130,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 1,
      flightNumber: null,
      source: "Heathrow Transfers",
      sender: "David R.",
      status: "won",
      detectedAt: agoMin(ref, 1500),
      originalMessage: "LHR T4 → Reading 11:00. 1 pax. £130. E-Class.",
      ...paid("card", [
        { id: "ex_j13_1", category: "fuel", amount: 20, note: "" },
        { id: "ex_j13_2", category: "parking", amount: 8, note: "Terminal short stay" },
        { id: "ex_j13_3", category: "other", amount: 5, note: "Waiting time" },
      ]),
      timeline: tl([
        ["Job detected", agoMin(ref, 1500)],
        ["Sender contacted", agoMin(ref, 1498)],
        ["Offer sent", agoMin(ref, 1496)],
        ["Reply received", agoMin(ref, 1470)],
        ["Job confirmed", agoMin(ref, 1460)],
      ]),
    },
    // Completed + Paid + Card
    {
      id: "j17",
      pickup: "LHR Terminal 3",
      dropoff: "Central London",
      pickupTime: inDays(ref, -1, 18, 0),
      price: 95,
      currency: GBP,
      vehicle: "S-Class",
      passengers: 2,
      flightNumber: null,
      source: "London Chauffeur Jobs",
      sender: "John M.",
      status: "won",
      detectedAt: agoMin(ref, 1700),
      originalMessage: "LHR T3 → Central London 18:00. 2 pax. £95. S-Class.",
      ...paid("card", [
        { id: "ex_j17_1", category: "fuel", amount: 18, note: "" },
        { id: "ex_j17_2", category: "congestion", amount: 15, note: "ULEZ" },
      ]),
      timeline: tl([
        ["Job detected", agoMin(ref, 1700)],
        ["Sender contacted", agoMin(ref, 1698)],
        ["Offer sent", agoMin(ref, 1696)],
        ["Reply received", agoMin(ref, 1670)],
        ["Job confirmed", agoMin(ref, 1660)],
      ]),
    },
    // Completed + Paid + Cash
    {
      id: "j20",
      pickup: "LHR Terminal 2",
      dropoff: "Reading",
      pickupTime: inDays(ref, -2, 8, 0),
      price: 65,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 2,
      flightNumber: null,
      source: "Heathrow Transfers",
      sender: "David R.",
      status: "won",
      detectedAt: agoMin(ref, 2880),
      originalMessage: "LHR T2 → Reading 08:00. 2 pax. £65. Cash on arrival.",
      ...paid("cash", [
        { id: "ex_j20_1", category: "fuel", amount: 18, note: "" },
        { id: "ex_j20_2", category: "commission", amount: 8, note: "Dispatch fee" },
      ]),
      timeline: tl([
        ["Job detected", agoMin(ref, 2880)],
        ["Sender contacted", agoMin(ref, 2878)],
        ["Offer sent", agoMin(ref, 2876)],
        ["Reply received", agoMin(ref, 2850)],
        ["Job confirmed", agoMin(ref, 2840)],
      ]),
    },
    // Completed + Paid + Invoice
    {
      id: "j15",
      pickup: "Heathrow Airport",
      dropoff: "Windsor",
      pickupTime: inDays(ref, -3, 9, 30),
      price: 70,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 3,
      flightNumber: null,
      source: "London Chauffeur Jobs",
      sender: "Emma L.",
      status: "won",
      detectedAt: agoMin(ref, 4500),
      originalMessage: "Heathrow → Windsor 09:30. 3 pax. £70. Invoice to company.",
      ...paid("invoice", [
        { id: "ex_j15_1", category: "fuel", amount: 10, note: "" },
        { id: "ex_j15_2", category: "tolls", amount: 5, note: "" },
        { id: "ex_j15_3", category: "commission", amount: 7, note: "Account commission" },
      ]),
      timeline: tl([
        ["Job detected", agoMin(ref, 4500)],
        ["Sender contacted", agoMin(ref, 4498)],
        ["Offer sent", agoMin(ref, 4496)],
        ["Reply received", agoMin(ref, 4470)],
        ["Job confirmed", agoMin(ref, 4460)],
      ]),
    },
    // Completed + Unpaid + Cash
    {
      id: "j14",
      pickup: "Gatwick Airport",
      dropoff: "Horsham",
      pickupTime: inDays(ref, -2, 14, 0),
      price: 85,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 2,
      flightNumber: null,
      source: "Sussex Chauffeurs",
      sender: "Sarah K.",
      status: "won",
      detectedAt: agoMin(ref, 3000),
      originalMessage: "Gatwick → Horsham 14:00. 2 pax. £85.",
      ...unpaid("cash", [{ id: "ex_j14_1", category: "fuel", amount: 15, note: "" }]),
      timeline: tl([
        ["Job detected", agoMin(ref, 3000)],
        ["Sender contacted", agoMin(ref, 2998)],
        ["Offer sent", agoMin(ref, 2996)],
        ["Reply received", agoMin(ref, 2970)],
        ["Job confirmed", agoMin(ref, 2960)],
      ]),
    },
    // Completed + Unpaid + Cash
    {
      id: "j19",
      pickup: "Gatwick Airport",
      dropoff: "Crawley",
      pickupTime: inDays(ref, -2, 16, 0),
      price: 60,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 1,
      flightNumber: null,
      source: "Sussex Chauffeurs",
      sender: "Sarah K.",
      status: "won",
      detectedAt: agoMin(ref, 3100),
      originalMessage: "Gatwick → Crawley 16:00. 1 pax. £60. Cash.",
      ...unpaid("cash", [{ id: "ex_j19_1", category: "fuel", amount: 12, note: "" }]),
      timeline: tl([
        ["Job detected", agoMin(ref, 3100)],
        ["Sender contacted", agoMin(ref, 3098)],
        ["Offer sent", agoMin(ref, 3096)],
        ["Reply received", agoMin(ref, 3070)],
        ["Job confirmed", agoMin(ref, 3060)],
      ]),
    },
    // Completed + Unpaid + Invoice (overdue invoice)
    {
      id: "j16",
      pickup: "Stansted Airport",
      dropoff: "Bishop's Stortford",
      pickupTime: inDays(ref, -4, 17, 0),
      price: 55,
      currency: GBP,
      vehicle: "E-Class",
      passengers: 1,
      flightNumber: null,
      source: "London Airport Runs",
      sender: "Mike T.",
      status: "won",
      detectedAt: agoMin(ref, 6000),
      originalMessage: "Stansted → Bishop's Stortford 17:00. 1 pax. £55. Invoice.",
      ...unpaid("invoice", []),
      timeline: tl([
        ["Job detected", agoMin(ref, 6000)],
        ["Sender contacted", agoMin(ref, 5998)],
        ["Offer sent", agoMin(ref, 5996)],
        ["Reply received", agoMin(ref, 5970)],
        ["Job confirmed", agoMin(ref, 5960)],
      ]),
    },
  ];
}

// Realistic activity history linked to the actual jobs above.
// Every entry references a real job route/price — no events for non-existent jobs.
export function buildActivity(ref) {
  const startedAt = addMonths(new Date(ref), -3).toISOString();
  const items = [
    // --- Today: live pipeline ---
    { type: "job", title: "RidePicker detected a new job", detail: "LHR Terminal 2 → Mayfair · £95", time: agoMin(ref, 4) },
    { type: "message", title: "Message received from John M.", detail: "London Chauffeur Jobs", time: agoMin(ref, 6) },
    { type: "job", title: "RidePicker detected a new job", detail: "Gatwick North → Central London · £110", time: agoMin(ref, 8) },
    { type: "job", title: "Job marked as won", detail: "Luton Airport → Cambridge · £90", time: agoMin(ref, 12) },
    { type: "job", title: "Job parsed from WhatsApp", detail: "Gatwick Airport → Brighton · £120", time: agoMin(ref, 18) },
    { type: "ridepicker", title: "RidePicker contacted the sender", detail: "Gatwick Airport → Brighton", time: agoMin(ref, 20) },
    { type: "message", title: "Message received from Sarah K.", detail: "Sussex Chauffeurs", time: agoMin(ref, 24) },
    { type: "job", title: "RidePicker detected a new job", detail: "LHR Terminal 5 → Southampton · price TBC", time: agoMin(ref, 30) },
    { type: "job", title: "Job marked as Interested", detail: "Gatwick Airport → Brighton · £120", time: agoMin(ref, 40) },
    { type: "job", title: "Job parsed from WhatsApp", detail: "Stansted Airport → Cambridge · £85", time: agoMin(ref, 50) },
    { type: "ridepicker", title: "Sender contacted", detail: "Stansted Airport → Cambridge", time: agoMin(ref, 55) },
    { type: "ridepicker", title: "RidePicker sent an offer", detail: "LHR Terminal 5 → Oxford · £140", time: agoMin(ref, 85) },
    { type: "job", title: "Job moved to Negotiating", detail: "LHR Terminal 5 → Oxford · £140", time: agoMin(ref, 90) },
    { type: "message", title: "Message received from David R.", detail: "Heathrow Transfers", time: agoMin(ref, 95) },
    { type: "message", title: "Reply received", detail: "LHR Terminal 5 → Oxford", time: agoMin(ref, 120) },
    { type: "job", title: "Job marked as won", detail: "London City Airport → Canary Wharf · £45", time: agoMin(ref, 140) },
    { type: "job", title: "Job marked as won", detail: "London City Airport → LHR Terminal 5 · £75", time: agoMin(ref, 150) },
    { type: "job", title: "Job lost to another driver", detail: "Luton Airport → Milton Keynes · £70", time: agoMin(ref, 200) },
    { type: "job", title: "Job ignored", detail: "LHR Terminal 3 → Windsor · £60", time: agoMin(ref, 240) },
    { type: "ridepicker", title: "Sender contacted", detail: "Stansted Airport → Liverpool Street", time: agoMin(ref, 300) },
    { type: "job", title: "RidePicker detected a new job", detail: "LHR Terminal 2 → Bath · £180", time: agoMin(ref, 320) },
    { type: "job", title: "Job marked as Interested", detail: "LHR Terminal 2 → Bath · £180", time: agoMin(ref, 360) },

    // --- Yesterday: completed jobs + payments + expenses ---
    { type: "job", title: "Job completed", detail: "LHR Terminal 4 → Reading · £130", time: agoMin(ref, 1450) },
    { type: "job", title: "Payment marked Paid", detail: "LHR Terminal 4 → Reading · £130 · Card", time: agoMin(ref, 1455) },
    { type: "job", title: "Expense added", detail: "LHR Terminal 4 → Reading · Fuel £20", time: agoMin(ref, 1460) },
    { type: "job", title: "Expense added", detail: "LHR Terminal 4 → Reading · Parking £8", time: agoMin(ref, 1462) },
    { type: "job", title: "Job completed", detail: "LHR Terminal 3 → Central London · £95", time: agoMin(ref, 1700) },
    { type: "job", title: "Payment marked Paid", detail: "LHR Terminal 3 → Central London · £95 · Card", time: agoMin(ref, 1710) },
    { type: "job", title: "Expense added", detail: "LHR Terminal 3 → Central London · Congestion £15", time: agoMin(ref, 1715) },

    // --- 2 days ago ---
    { type: "job", title: "Job completed", detail: "LHR Terminal 2 → Reading · £65 · Cash", time: agoMin(ref, 2880) },
    { type: "job", title: "Payment marked Paid", detail: "LHR Terminal 2 → Reading · £65 · Cash", time: agoMin(ref, 2885) },
    { type: "job", title: "Expense added", detail: "LHR Terminal 2 → Reading · Commission £8", time: agoMin(ref, 2890) },
    { type: "job", title: "Job completed", detail: "Gatwick Airport → Horsham · £85", time: agoMin(ref, 2960) },
    { type: "job", title: "Job completed", detail: "Gatwick Airport → Crawley · £60", time: agoMin(ref, 3060) },
    { type: "ridepicker", title: "RidePicker resumed", detail: "Monitoring resumed in Assist mode.", time: agoMin(ref, 2880) },

    // --- 3 days ago ---
    { type: "job", title: "Job completed", detail: "Heathrow Airport → Windsor · £70", time: agoMin(ref, 4320) },
    { type: "job", title: "Payment marked Paid", detail: "Heathrow Airport → Windsor · £70 · Invoice", time: agoMin(ref, 4460) },
    { type: "job", title: "Expense added", detail: "Heathrow Airport → Windsor · Tolls £5", time: agoMin(ref, 4470) },
    { type: "ridepicker", title: "RidePicker paused", detail: "Monitoring stopped.", time: agoMin(ref, 4320) },

    // --- Account lifecycle ---
    { type: "ridepicker", title: "RidePicker enabled", detail: "Monitoring started in Assist mode.", time: agoMin(ref, 7200) },
    { type: "whatsapp", title: "WhatsApp connected", detail: "Account linked.", time: startedAt },
  ];
  return items
    .map((e, i) => ({ id: `act_${i}`, ...e }))
    .sort((a, b) => new Date(b.time) - new Date(a.time));
}

export function buildDevUser() {
  const ref = Date.now();
  const now = new Date(ref);
  const startedAt = addMonths(now, -3).toISOString();
  const nextPaymentDate = addMonths(now, 1).toISOString();
  const invoices = [];
  for (let i = 4; i >= 1; i--) {
    const d = addMonths(now, -i);
    invoices.push({ id: invId(d), date: d.toISOString(), amount: PLAN.price, status: "paid" });
  }
  invoices.push({ id: invId(now), date: now.toISOString(), amount: PLAN.price, status: "paid" });

  return {
    id: DEV_ID,
    full_name: "Dominykas",
    name: "Dominykas",
    phone: DEV_PHONE,
    email: "dominykas@ridepicker.dev",
    createdAt: startedAt,
    profile: { name: "Dominykas", phone: DEV_PHONE, email: "dominykas@ridepicker.dev" },
    subscription: {
      status: "active",
      plan: PLAN,
      startedAt,
      nextPaymentDate,
      paymentMethod: MOCK_CARD,
      invoices,
    },
    whatsapp: {
      status: "connected",
      account: { name: "Dominykas (Chauffeur)", phone: MOCK_WA_PHONE },
      connectedAt: startedAt,
    },
    // Established customer: RidePicker already active in Assist mode.
    ridepicker: { mode: "assist", botStartedAt: addMonths(now, -1).toISOString() },
    jobs: buildJobs(ref),
    activity: buildActivity(ref),
  };
}