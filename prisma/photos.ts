// Stock photography (Unsplash licence) used for the sample listings. Photos are representative, not the exact car.
// Replace with your own photos from the admin (Vehicles → edit → Photographs).
const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const HERO = u("1615908397724-6dc711db34a7", 2400);
export const ABOUT = u("1762195340046-415140d8b1b2", 1400);

export const PHOTOS: Record<string, string[]> = {
  "Toyota Land Cruiser ZX": ["1650530579355-7ad9d4766043", "1709620435533-56483034bdd4", "1554841649-de947c4b954a"],
  "Mercedes-Benz S-Class S500": ["1610099610040-ab19f3a5ec35", "1619221496652-7ee3d7406203", "1696294698346-a792de6be3bd"],
  "BMW M4 Competition": ["1615908397724-6dc711db34a7", "1731988666860-b4b5e312ed82", "1629019879059-2a0345f93aea"],
  "Porsche Macan S": ["1762195340046-415140d8b1b2", "1660209514955-032388bc33f7", "1581222225839-886e8ae472f8"],
  "Land Rover Range Rover Vogue": ["1700884520248-92092bd21e63", "1760552234270-4702f8e3f750", "1763789381051-a3d094bc4f87"],
  "Audi e-tron GT": ["1704340142770-b52988e5b6eb", "1615829386703-e2bb66a7cb7d", "1763543007050-4dac73ffc67f"],
  "Honda Civic RS Turbo": ["1594070319944-7c0cbebb6f58", "1761315087712-4b1bd53ce39b", "1605816988069-b11383b50717"],
  "Toyota Corolla Altis X": ["1641430141849-cdc9073fd3d7", "1663852408695-f57f4d75a536", "1715253554628-9f4bb65ebfba"],
  "Suzuki Alto VXL AGS": ["1699862335489-36f7dec55c0e", "1641430141849-cdc9073fd3d7", "1663852408695-f57f4d75a536"],
  "Toyota Hilux Revo G": ["1559416523-140ddc3d238c", "1649793395985-967862a3b73f", "1762236096060-964c4acb6700"],
  "KIA Sportage Alpha": ["1610064094665-57e727e29f8b", "1638835373951-3a67da7aaf8d", "1762236092991-1b7f91a18f9a"],
  "Hyundai Tucson AWD": ["1747414632749-6c8b14ba30fd", "1610064094665-57e727e29f8b", "1700884520248-92092bd21e63"],
};
export const photoUrls = (title: string) => (PHOTOS[title] ?? []).map((id) => u(id));
