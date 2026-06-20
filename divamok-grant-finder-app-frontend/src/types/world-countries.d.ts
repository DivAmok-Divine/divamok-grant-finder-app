declare module 'world-countries' {
  interface WorldCountry {
    name: { common: string; official: string }
    cca2: string
    flag: string
  }
  const countries: WorldCountry[]
  export default countries
}
