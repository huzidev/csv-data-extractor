# CSV Data Extractor

A RemixJS TypeScript application that allows users to upload CSV files and map column headings to database fields. Built with Prisma, SQLite, PapaParse, and Tailwind CSS.

## Features

- **CSV Upload**: Upload CSV files using a simple drag-and-drop interface
- **Column Mapping**: Automatically extract CSV column headings and map them to database fields (First Name, Last Name, Phone, Email, Studio)
- **Data Preview**: Preview the first 5 rows of uploaded data before saving
- **Database Integration**: Save mapped data to SQLite database using Prisma ORM
- **Tailwind CSS**: Modern and responsive user interface

## Tech Stack

- **RemixJS**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Prisma**: Database ORM with SQLite
- **Tailwind CSS**: Utility-first CSS framework
- **PapaParse**: CSV parsing library

## Database Schema

```typescript
model User {
  id        Int      @id @default(autoincrement())
  firstName String
  lastName  String
  phone     String
  email     String   @unique
  studio    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Getting Started

### Prerequisites

- Node.js (>= 20.0.0)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```sh
npm install
```

3. Set up the database:

```sh
npx prisma migrate dev --name init
```

## Development

Run the development server:

```sh
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Usage

1. **Upload CSV**: Click "Choose CSV File" and select your CSV file
2. **Map Columns**: Use the dropdown menus to map CSV columns to database fields:
   - First Name
   - Last Name
   - Phone
   - Email
   - Studio
3. **Preview Data**: Review the first 5 rows of your data
4. **Save**: Click "Save to Database" to import the data

## Example CSV Format

```csv
fName,lName,number,email,studio,id,product
John,Doe,123-456-7890,john@example.com,Studio A,1,Product X
Jane,Smith,098-765-4321,jane@example.com,Studio B,2,Product Y
```

You would map:
- First Name → fName
- Last Name → lName
- Phone → number
- Email → email
- Studio → studio

## API Endpoints

- `POST /api/users/import` - Import users from CSV data

## Deployment

Build for production:

```sh
npm run build
```

Start production server:

```sh
npm start
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions, please open an issue on GitHub.

## Testing

A sample CSV file (`sample-data.csv`) is included in the project root for testing purposes. You can use this file to test the column mapping functionality:

```csv
fName,lName,number,email,studio,id,product
John,Doe,123-456-7890,john.doe@example.com,Studio A,1,Product X
Jane,Smith,098-765-4321,jane.smith@example.com,Studio B,2,Product Y
```

### Test Steps

1. Start the development server: `npm run dev`
2. Open `http://localhost:5173` in your browser
3. Upload the `sample-data.csv` file
4. Map the columns:
   - First Name → fName
   - Last Name → lName
   - Phone → number
   - Email → email
   - Studio → studio
5. Preview the data and save to database

## Troubleshooting

### "Too many open files" Error

If you encounter this error on Windows, it's typically related to Material-UI icon imports. The project has been optimized to use specific icon imports to prevent this issue.

### Development Server Issues

If the development server fails to start:
1. Stop any running Node processes
2. Clear the node_modules cache: `npm run dev -- --force`
3. Restart the development server
