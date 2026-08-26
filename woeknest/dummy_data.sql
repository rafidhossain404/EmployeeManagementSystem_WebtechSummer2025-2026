-- ============================================================
-- WORKNEST - DUMMY DATA FOR TESTING
-- Run this after creating the database schema
-- ============================================================

-- ============================================================
-- 1. INSERT USERS
-- ============================================================

-- HR Users
INSERT INTO User (
    UserName, Password, Role, Dept, Salary, 
    FirstName, LastName, DOB, Gender, 
    Email, Phone, Address, Status, JoinDate
) VALUES 
('hr_hira', 'hira123', 'HR', 'HR', 55000.00, 
 'Hira', 'Islam', '1985-03-15', 'Female', 
 'hira@company.com', '01710000001', '123 Gulshan, Dhaka', 'Active', '2020-01-15'),
('hr_rahman', 'rahman123', 'HR', 'HR', 52000.00,
 'Rahman', 'Ahmed', '1988-07-20', 'Male',
 'rahman@company.com', '01710000002', '456 Banani, Dhaka', 'Active', '2021-03-10');

-- Managers
INSERT INTO User (
    UserName, Password, Role, Dept, Salary, 
    FirstName, LastName, DOB, Gender, 
    Email, Phone, Address, Status, JoinDate
) VALUES 
('soft_manik', 'manik123', 'Software_Manager', 'Software', 85000.00, 
 'Manik', 'Roy', '1988-07-22', 'Male', 
 'manik@company.com', '01710000003', '789 Dhanmondi, Dhaka', 'Active', '2019-05-10'),
('market_mukta', 'mukta123', 'Marketing_Manager', 'Marketing', 82000.00, 
 'Mukta', 'Begum', '1990-11-05', 'Female', 
 'mukta@company.com', '01710000004', '321 Mirpur, Dhaka', 'Active', '2021-03-22'),
('facility_emon', 'emon123', 'Facilities_Manager', 'Facilities', 78000.00, 
 'Emon', 'Khan', '1987-09-18', 'Male', 
 'emon@company.com', '01710000005', '654 Uttara, Dhaka', 'Active', '2018-11-30');

-- Software Department Employees
INSERT INTO User (
    UserName, Password, Role, Dept, Salary, 
    FirstName, LastName, DOB, Gender, 
    Email, Phone, Address, Status, JoinDate
) VALUES 
('dev_limon', 'limon123', 'Software_Developer', 'Software', 65000.00, 
 'Limon', 'Ahmed', '1992-04-30', 'Male', 
 'limon@company.com', '01710000006', '987 Bashundhara, Dhaka', 'Active', '2022-02-14'),
('design_tonay', 'tonay123', 'Software_Designer', 'Software', 62000.00, 
 'Tonay', 'Saha', '1993-08-12', 'Male', 
 'tonay@company.com', '01710000007', '147 Mohammadpur, Dhaka', 'Active', '2021-09-05'),
('test_izar', 'izar123', 'Software_Tester', 'Software', 58000.00, 
 'Izar', 'Rahman', '1994-01-25', 'Male', 
 'izar@company.com', '01710000008', '258 Motijheel, Dhaka', 'Active', '2023-01-10'),
('dev_nadia', 'nadia123', 'Software_Developer', 'Software', 60000.00,
 'Nadia', 'Hossain', '1995-06-18', 'Female',
 'nadia@company.com', '01710000009', '369 Baridhara, Dhaka', 'Active', '2022-08-01');

-- Marketing Department Employees
INSERT INTO User (
    UserName, Password, Role, Dept, Salary, 
    FirstName, LastName, DOB, Gender, 
    Email, Phone, Address, Status, JoinDate
) VALUES 
('sales_rom', 'rom123', 'Salesman', 'Marketing', 52000.00, 
 'Rom', 'Das', '1991-06-08', 'Male', 
 'rom@company.com', '01710000010', '741 Khilgaon, Dhaka', 'Active', '2020-08-17'),
('digital_aryan', 'aryan123', 'Digital_Marketing_Specialist', 'Marketing', 60000.00, 
 'Aryan', 'Singh', '1995-02-14', 'Male', 
 'aryan@company.com', '01710000011', '852 Tejgaon, Dhaka', 'Active', '2022-11-03'),
('pr_nur', 'nur123', 'PR_Officer', 'Marketing', 57000.00, 
 'Nur', 'Hossain', '1989-12-20', 'Male', 
 'nur@company.com', '01710000012', '963 Pallabi, Dhaka', 'Active', '2019-07-25'),
('content_sima', 'sima123', 'Content_Marketing_Specialist', 'Marketing', 55000.00,
 'Sima', 'Rahman', '1993-09-10', 'Female',
 'sima@company.com', '01710000013', '159 Mirpur, Dhaka', 'Active', '2023-04-15');

-- Facilities Department Employees
INSERT INTO User (
    UserName, Password, Role, Dept, Salary, 
    FirstName, LastName, DOB, Gender, 
    Email, Phone, Address, Status, JoinDate
) VALUES 
('driver_karim', 'karim123', 'Driver', 'Facilities', 45000.00, 
 'Karim', 'Mia', '1983-10-05', 'Male', 
 'karim@company.com', '01710000014', '852 Tejgaon, Dhaka', 'Active', '2020-04-12'),
('cleaner_rupali', 'rupali123', 'Cleaner', 'Facilities', 35000.00,
 'Rupali', 'Khatun', '1986-03-25', 'Female',
 'rupali@company.com', '01710000015', '753 Mohammadpur, Dhaka', 'Active', '2021-06-20'),
('watchman_sohel', 'sohel123', 'Watchman', 'Facilities', 32000.00,
 'Sohel', 'Rana', '1988-11-30', 'Male',
 'sohel@company.com', '01710000016', '654 Mirpur, Dhaka', 'Inactive', '2022-01-15');

-- ============================================================
-- 2. INSERT INTO HR TABLE
-- ============================================================

INSERT INTO HR (UserName) VALUES 
('hr_hira'),
('hr_rahman');

-- ============================================================
-- 3. INSERT INTO MANAGER TABLE
-- ============================================================

INSERT INTO Manager (UserName) VALUES 
('soft_manik'),
('market_mukta'),
('facility_emon');

-- ============================================================
-- 4. INSERT INTO EMPLOYEE TABLE
-- ============================================================

-- Managers are also employees
INSERT INTO Employee (UserName, ManagerID) VALUES 
('soft_manik', NULL),
('market_mukta', NULL),
('facility_emon', NULL),
-- Software employees under soft_manik (ManagerID = 1)
('dev_limon', 1),
('design_tonay', 1),
('test_izar', 1),
('dev_nadia', 1),
-- Marketing employees under market_mukta (ManagerID = 2)
('sales_rom', 2),
('digital_aryan', 2),
('pr_nur', 2),
('content_sima', 2),
-- Facilities employees under facility_emon (ManagerID = 3)
('driver_karim', 3),
('cleaner_rupali', 3),
('watchman_sohel', 3);

-- ============================================================
-- 5. INSERT INTO TASK TABLE
-- ============================================================

-- dev_limon = 4, design_tonay = 5, test_izar = 6, dev_nadia = 7
-- sales_rom = 8, digital_aryan = 9, pr_nur = 10, content_sima = 11
-- driver_karim = 12, cleaner_rupali = 13, watchman_sohel = 14

INSERT INTO Task (EmployeeID, AD, ED, Status, Instruction) VALUES 
-- Tasks for dev_limon (EmployeeID 4)
(4, '2024-01-10', '2024-01-20', 'Completed', 'Develop login module with authentication and authorization'),
(4, '2024-02-01', '2024-02-15', 'Completed', 'Create user management dashboard with CRUD operations'),
(4, '2024-03-01', '2024-03-20', 'In Progress', 'Implement payroll calculation system'),
(4, '2024-04-01', '2024-04-15', 'Pending', 'Build report generation module'),

-- Tasks for design_tonay (EmployeeID 5)
(5, '2024-01-05', '2024-01-25', 'Completed', 'Design dashboard UI with responsive layout and modern themes'),
(5, '2024-02-10', '2024-02-28', 'Completed', 'Design mobile interface for the main application'),
(5, '2024-03-15', '2024-03-30', 'Pending', 'Design admin panel with advanced analytics'),

-- Tasks for test_izar (EmployeeID 6)
(6, '2024-01-15', '2024-01-30', 'Completed', 'Test login functionality including edge cases and security'),
(6, '2024-02-10', '2024-02-20', 'Completed', 'Performance testing and optimization'),
(6, '2024-03-05', '2024-03-15', 'In Progress', 'Automated test suite development'),

-- Tasks for dev_nadia (EmployeeID 7)
(7, '2024-02-01', '2024-02-20', 'Completed', 'API development for employee management'),
(7, '2024-03-01', '2024-03-15', 'In Progress', 'Integrate third-party services'),

-- Tasks for sales_rom (EmployeeID 8)
(8, '2024-01-20', '2024-02-10', 'Completed', 'Meet with client ABC Corp for quarterly sales review'),
(8, '2024-02-15', '2024-02-28', 'Completed', 'Prepare sales proposal for new client'),
(8, '2024-03-01', '2024-03-10', 'Pending', 'Sales training and team meeting'),

-- Tasks for digital_aryan (EmployeeID 9)
(9, '2024-01-20', '2024-02-05', 'Completed', 'Social media campaign for new product launch'),
(9, '2024-02-10', '2024-02-25', 'Completed', 'SEO optimization for company website'),
(9, '2024-03-01', '2024-03-20', 'In Progress', 'Digital marketing strategy for Q2 2024'),

-- Tasks for pr_nur (EmployeeID 10)
(10, '2024-02-15', '2024-02-25', 'Completed', 'Organize press conference for company anniversary'),
(10, '2024-03-01', '2024-03-15', 'Pending', 'Prepare PR materials for product launch'),

-- Tasks for content_sima (EmployeeID 11)
(11, '2024-02-01', '2024-02-15', 'Completed', 'Write blog posts for company website'),
(11, '2024-02-20', '2024-03-05', 'Completed', 'Create content calendar for social media'),

-- Tasks for driver_karim (EmployeeID 12)
(12, '2024-02-01', '2024-02-01', 'Completed', 'Office pickup and delivery of important documents'),
(12, '2024-02-05', '2024-02-05', 'Completed', 'Airport pickup for visiting executives'),
(12, '2024-03-10', '2024-03-10', 'Pending', 'Vehicle maintenance and servicing'),

-- Tasks for cleaner_rupali (EmployeeID 13)
(13, '2024-02-01', '2024-02-01', 'Completed', 'Office cleaning and maintenance work'),
(13, '2024-03-01', '2024-03-01', 'Completed', 'Deep cleaning of all office areas');

-- ============================================================
-- 6. INSERT INTO PROMOTION TABLE
-- ============================================================

INSERT INTO Promotion (EmployeeID, PromotionDate, Status) VALUES 
-- dev_limon (EmployeeID 4) promotions
(4, '2023-06-15', 'Approved'),
(4, '2024-01-20', 'Pending'),
(4, '2023-04-20', 'Rejected'),

-- design_tonay (EmployeeID 5) promotions
(5, '2024-01-20', 'Processing'),
(5, '2022-09-05', 'Approved'),

-- test_izar (EmployeeID 6) promotions
(6, '2022-11-10', 'Approved'),
(6, '2024-01-10', 'Pending'),

-- sales_rom (EmployeeID 8) promotions
(8, '2023-08-25', 'Approved'),

-- digital_aryan (EmployeeID 9) promotions
(9, '2024-02-01', 'Pending'),

-- pr_nur (EmployeeID 10) promotions
(10, '2023-03-30', 'Approved'),

-- driver_karim (EmployeeID 12) promotions
(12, '2023-12-15', 'Approved'),

-- dev_nadia (EmployeeID 7) promotions
(7, '2024-02-15', 'Processing'),

-- content_sima (EmployeeID 11) promotions
(11, '2024-03-01', 'Pending');

-- ============================================================
-- 7. INSERT INTO LEAVE TABLE
-- ============================================================

INSERT INTO `Leave` (UserName, SD, ED, Reason, Status) VALUES 
-- HR Leaves
('hr_hira', '2024-01-20', '2024-01-25', 'Attending family wedding ceremony in hometown', 'Accepted'),
('hr_hira', '2024-03-10', '2024-03-12', 'Medical checkup and follow-up appointment', 'Pending'),
('hr_rahman', '2024-02-15', '2024-02-18', 'Annual vacation with family', 'Accepted'),

-- Manager Leaves
('soft_manik', '2024-02-10', '2024-02-12', 'Medical checkup and follow-up appointment', 'Accepted'),
('soft_manik', '2024-04-01', '2024-04-05', 'Annual leave for personal refreshment', 'Pending'),
('market_mukta', '2024-03-01', '2024-03-05', 'Annual vacation with family to Coxs Bazar', 'Processing'),
('facility_emon', '2024-01-15', '2024-01-16', 'Personal work related to property documentation', 'Accepted'),

-- Employee Leaves
('dev_limon', '2024-02-20', '2024-02-22', 'Sick leave due to viral fever and doctor advised rest', 'Accepted'),
('dev_limon', '2024-04-10', '2024-04-12', 'Family emergency', 'Pending'),
('design_tonay', '2024-03-10', '2024-03-15', 'Holiday trip to Saint Martin island', 'Processing'),
('test_izar', '2024-01-05', '2024-01-10', 'Annual leave for personal refreshment and family time', 'Accepted'),
('test_izar', '2024-03-20', '2024-03-22', 'Personal work', 'Pending'),
('dev_nadia', '2024-02-25', '2024-02-26', 'Doctor appointment for regular health checkup', 'Accepted'),
('sales_rom', '2024-02-25', '2024-02-26', 'Doctor appointment for regular health checkup', 'Accepted'),
('digital_aryan', '2024-03-05', '2024-03-07', 'Family function - cousins wedding ceremony', 'Processing'),
('pr_nur', '2024-04-01', '2024-04-03', 'Marriage ceremony of elder sister', 'Pending'),
('content_sima', '2024-03-15', '2024-03-16', 'Personal leave for house shifting', 'Accepted'),
('driver_karim', '2024-02-10', '2024-02-10', 'Vehicle registration renewal', 'Accepted'),
('cleaner_rupali', '2024-02-20', '2024-02-20', 'Personal emergency leave', 'Rejected'),
('watchman_sohel', '2024-03-01', '2024-03-03', 'Family medical emergency', 'Pending');

-- ============================================================
-- 8. VERIFICATION QUERIES (Run these to check your data)
-- ============================================================

SELECT 'Total Users:' as Label, COUNT(*) as Count FROM User;
SELECT Role, COUNT(*) as Count FROM User GROUP BY Role ORDER BY Role;
SELECT Dept, COUNT(*) as Count FROM User WHERE Role NOT IN ('HR', 'Manager') GROUP BY Dept;
SELECT COUNT(*) as PendingLeaves FROM `Leave` WHERE Status IN ('Pending', 'Processing');
SELECT COUNT(*) as PendingPromotions FROM Promotion WHERE Status IN ('Pending', 'Processing');
SELECT Status, COUNT(*) as Count FROM Task GROUP BY Status;
SELECT UserName, FirstName, LastName, Role, Dept, Status FROM User ORDER BY Role, Dept, FirstName;