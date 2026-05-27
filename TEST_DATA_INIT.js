// Optional: Test Data Initialization Script
// Run this in browser console to populate demo data

function initializeTestData() {
    // Clear existing data
    localStorage.clear();
    
    // Initialize empty collections
    initializeDB();
    
    // Create test users
    const testUsers = [
        {
            fullName: "John Doe",
            email: "john@example.com",
            phone: "+1 (555) 123-4567",
            password: "password123",
            role: "user",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            fullName: "Sarah Smith",
            email: "sarah@example.com",
            phone: "+1 (555) 234-5678",
            password: "password123",
            role: "user",
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            fullName: "Admin User",
            email: "admin@example.com",
            phone: "+1 (555) 345-6789",
            password: "admin123",
            role: "admin",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    testUsers.forEach(user => {
        const newUser = { ...user };
        newUser.id = generateId();
        const users = getRecords(DB.users);
        users.push(newUser);
        localStorage.setItem(DB.users, JSON.stringify(users));
    });
    
    // Create test lost items
    const lostItems = [
        {
            itemName: "Silver Wedding Ring",
            category: "jewelry",
            description: "White gold wedding ring with 3 small diamonds. Very sentimental.",
            locationLost: "Downtown Shopping Mall",
            dateLost: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            imageURL: null,
            ownerId: getRecords(DB.users)[0].id,
            status: "open",
            contactInfo: "john@example.com",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            itemName: "Black Leather Wallet",
            category: "wallet",
            description: "Black leather wallet with important documents and cards. Contains driver's license.",
            locationLost: "Central Park",
            dateLost: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            imageURL: null,
            ownerId: getRecords(DB.users)[0].id,
            status: "open",
            contactInfo: "+1 (555) 123-4567",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            itemName: "AirPods Pro",
            category: "electronics",
            description: "Silver AirPods Pro with charging case. Case is slightly scratched.",
            locationLost: "Coffee Shop on 5th Avenue",
            dateLost: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            imageURL: null,
            ownerId: getRecords(DB.users)[1].id,
            status: "open",
            contactInfo: "sarah@example.com",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    lostItems.forEach(item => {
        addRecord(DB.lostItems, item);
    });
    
    // Create test found items
    const foundItems = [
        {
            itemName: "Blue Backpack",
            category: "accessories",
            description: "Navy blue backpack with multiple pockets. Contains some textbooks.",
            locationFound: "City Bus Station",
            dateFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            imageURL: null,
            finderId: getRecords(DB.users)[1].id,
            status: "available",
            contactInfo: "+1 (555) 234-5678",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            itemName: "House Keys",
            category: "keys",
            description: "Set of 3 house keys on a red key ring. Found at restaurant entrance.",
            locationFound: "Tony's Italian Restaurant",
            dateFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            imageURL: null,
            finderId: getRecords(DB.users)[0].id,
            status: "available",
            contactInfo: "john@example.com",
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    foundItems.forEach(item => {
        addRecord(DB.foundItems, item);
    });
    
    alert('Test data initialized successfully! You can now login with:\n\nEmail: john@example.com\nPassword: password123\n\nOR\n\nEmail: admin@example.com (Admin)\nPassword: admin123');
    window.location.reload();
}

// Call this function in browser console to initialize test data:
// initializeTestData()
