/* ============================================================
   mock-data.js
   Pure front-end stand-in for the old PHP + MySQL backend.
   Everything lives in memory (window.WORKNEST) and resets on
   every page reload — there is no server and no database.
   ============================================================ */

window.WORKNEST = (function () {
  const hrUser = { firstName: "Ayesha", lastName: "Rahman" };

  const managers = [
    { ManagerID: 1, UserName: "mgr.software", FirstName: "Tanvir", LastName: "Chowdhury" },
    { ManagerID: 2, UserName: "mgr.marketing", FirstName: "Nusrat", LastName: "Jahan" },
    { ManagerID: 3, UserName: "mgr.facilities", FirstName: "Kamal", LastName: "Hossain" }
  ];

  const employees = [
    { EmployeeID: 101, UserName: "s.developer1", FirstName: "Rafiq", LastName: "Islam", Role: "Software_Developer", Dept: "Software", Status: "Active", Email: "rafiq.islam@worknest.io", Phone: "01711000001", Address: "House 12, Road 5, Dhanmondi, Dhaka", Salary: 65000, ManagerID: 1 },
    { EmployeeID: 102, UserName: "s.designer1", FirstName: "Mitu", LastName: "Akter", Role: "Software_Designer", Dept: "Software", Status: "Active", Email: "mitu.akter@worknest.io", Phone: "01711000002", Address: "Flat 3B, Banani, Dhaka", Salary: 58000, ManagerID: 1 },
    { EmployeeID: 103, UserName: "s.tester1", FirstName: "Imran", LastName: "Kabir", Role: "Software_Tester", Dept: "Software", Status: "On_leave", Email: "imran.kabir@worknest.io", Phone: "01711000003", Address: "Mirpur 10, Dhaka", Salary: 52000, ManagerID: 1 },
    { EmployeeID: 104, UserName: "salesman1", FirstName: "Farhan", LastName: "Ahmed", Role: "Salesman", Dept: "Marketing", Status: "Active", Email: "farhan.ahmed@worknest.io", Phone: "01711000004", Address: "Uttara Sector 7, Dhaka", Salary: 40000, ManagerID: 2 },
    { EmployeeID: 105, UserName: "dm.specialist1", FirstName: "Sadia", LastName: "Islam", Role: "Digital_Marketing_Specialist", Dept: "Marketing", Status: "Active", Email: "sadia.islam@worknest.io", Phone: "01711000005", Address: "Gulshan 2, Dhaka", Salary: 47000, ManagerID: 2 },
    { EmployeeID: 106, UserName: "pr.officer1", FirstName: "Nabil", LastName: "Hasan", Role: "PR_Officer", Dept: "Marketing", Status: "Inactive", Email: "nabil.hasan@worknest.io", Phone: "01711000006", Address: "Bashundhara R/A, Dhaka", Salary: 45000, ManagerID: 2 },
    { EmployeeID: 107, UserName: "driver1", FirstName: "Jashim", LastName: "Uddin", Role: "Driver", Dept: "Facilities", Status: "Active", Email: "jashim.uddin@worknest.io", Phone: "01711000007", Address: "Mohammadpur, Dhaka", Salary: 22000, ManagerID: 3 },
    { EmployeeID: 108, UserName: "cleaner1", FirstName: "Rina", LastName: "Begum", Role: "Cleaner", Dept: "Facilities", Status: "Active", Email: "rina.begum@worknest.io", Phone: "01711000008", Address: "Jatrabari, Dhaka", Salary: 18000, ManagerID: 3 }
  ];

  const leaves = [
    { LeaveID: 1, UserName: "s.developer1", FirstName: "Rafiq", LastName: "Islam", Dept: "Software", SD: "2026-09-02", ED: "2026-09-05", Reason: "Family emergency requiring travel to hometown for a few days", Status: "Processing" },
    { LeaveID: 2, UserName: "s.tester1", FirstName: "Imran", LastName: "Kabir", Dept: "Software", SD: "2026-08-25", ED: "2026-09-01", Reason: "Approved medical leave, recovering from minor surgery", Status: "Accepted" },
    { LeaveID: 3, UserName: "salesman1", FirstName: "Farhan", LastName: "Ahmed", Dept: "Marketing", SD: "2026-09-10", ED: "2026-09-12", Reason: "Attending a relative's wedding out of town", Status: "Processing" },
    { LeaveID: 4, UserName: "pr.officer1", FirstName: "Nabil", LastName: "Hasan", Dept: "Marketing", SD: "2026-08-15", ED: "2026-08-18", Reason: "Personal reasons, requested extended time off", Status: "Rejected" },
    { LeaveID: 5, UserName: "driver1", FirstName: "Jashim", LastName: "Uddin", Dept: "Facilities", SD: "2026-09-15", ED: "2026-09-16", Reason: "Child's school event, need one day off", Status: "Pending" }
  ];

  const promotions = [
    { PromotionID: 1, EmployeeID: 102, FirstName: "Mitu", LastName: "Akter", Dept: "Software", Role: "Software_Designer", Status: "Processing", PromotionDate: "2026-08-20" },
    { PromotionID: 2, EmployeeID: 105, FirstName: "Sadia", LastName: "Islam", Dept: "Marketing", Role: "Digital_Marketing_Specialist", Status: "Processing", PromotionDate: "2026-08-18" },
    { PromotionID: 3, EmployeeID: 101, FirstName: "Rafiq", LastName: "Islam", Dept: "Software", Role: "Software_Developer", Status: "Approved", PromotionDate: "2026-07-30" },
    { PromotionID: 4, EmployeeID: 107, FirstName: "Jashim", LastName: "Uddin", Dept: "Facilities", Role: "Driver", Status: "Rejected", PromotionDate: "2026-07-10" },
    { PromotionID: 5, EmployeeID: 104, FirstName: "Farhan", LastName: "Ahmed", Dept: "Marketing", Role: "Salesman", Status: "Pending", PromotionDate: "2026-08-27" }
  ];

  const availableRoles = {
    Software_Developer: "Software Developer", Software_Designer: "Software Designer",
    Software_Tester: "Software Tester", Software_Manager: "Software Manager",
    Salesman: "Salesman", Digital_Marketing_Specialist: "Digital Marketing Specialist",
    Content_Marketing_Specialist: "Content Marketing Specialist", PR_Officer: "PR Officer",
    Marketing_Manager: "Marketing Manager", Driver: "Driver", Cleaner: "Cleaner",
    Watchman: "Watchman", Facilities_Manager: "Facilities Manager"
  };

  function findEmployee(id) {
    return employees.find((e) => e.EmployeeID === Number(id)) || null;
  }

  return { hrUser, managers, employees, leaves, promotions, availableRoles, findEmployee };
})();
